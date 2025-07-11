import { Router, Request, Response } from "express";
import {
  validateLogin,
  validateRegister,
  validateLogout,
} from "../middlwares/validations";
import { LONG_EXPIRE_TIME, SHORT_EXPIRE_TIME } from "../utils/constants";
import { createToken } from "../utils/tokens";
import { validationResult } from "express-validator";
import { createUser, getUser } from "../services/userService";
import bcrypt from "bcrypt";
import { storeTokens } from "../services/tokenService";

// TODO: unitfy login and register token per mode handling (separate into functions)

const router: Router = Router();
// How complex will the hash be
const saltRounds = 10;

// Handle stateless authentication
router.post("/logout-stateless", (req: Request, res: Response) => {
  console.log("logout-stateless", req.body);
  res.send("Hello World Logout");
});

router.post("/login", validateLogin, async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Check if user exists
  const { email, password } = req.body;
  const user = await getUser(email);

  if (user._tag === "Failure") {
    res.status(400).json({ error: user.error });
    return;
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_ACCESS_SECRET) {
    res.status(500).json({ error: "JWT_SECRET is not set" });
    return;
  }

  // Check user password if it matches hashed password
  const hashedPassword = user.data.password;
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);

  if (!isPasswordValid) {
    res.status(400).json({ error: "Invalid password" });
    return;
  }

  // Handle user login based on mode
  if (req.body.mode === "stateless_simple") {
    const token = createToken(
      { email },
      user.data.id,
      process.env.JWT_SECRET,
      LONG_EXPIRE_TIME
    );

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: LONG_EXPIRE_TIME,
      })
      .status(200)
      .json({ email: user.data.email, userId: user.data.id });
  } else if (req.body.mode === "hybrid") {
    // Create refresh token
    const refreshToken = createToken(
      { email },
      user.data.id,
      process.env.JWT_SECRET,
      LONG_EXPIRE_TIME
    );

    // Create access token
    const accessToken = createToken(
      { email },
      user.data.id,
      process.env.JWT_ACCESS_SECRET,
      SHORT_EXPIRE_TIME
    );

    const tokenResult = await storeTokens({
      accessToken,
      refreshToken,
      userId: user.data.id,
    });

    if (tokenResult._tag === "Failure") {
      res.status(500).json({ error: tokenResult.error });
      return;
    }

    return res
      .cookie("token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: LONG_EXPIRE_TIME,
      })
      .status(200)
      .json({
        accessToken,
        email: user.data.email,
      });
  }

  // Else is statefull
  return res.send("Login statefull");
});

router.post(
  "/register",
  validateRegister,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Salt and hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await createUser({ email, password: hashedPassword });

    if (result._tag === "Failure") {
      res.status(400).json({ error: result.error });
      return;
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_ACCESS_SECRET) {
      res
        .status(500)
        .json({ error: "JWT_SECRET or JWT_ACCESS_SECRET is not set" });
      return;
    }

    if (req.body.mode === "stateless_simple") {
      const token = createToken(
        { email },
        result.data.id,
        process.env.JWT_SECRET,
        LONG_EXPIRE_TIME
      );

      return res
        .cookie("token", token, {
          // Only accessible by the web server
          httpOnly: true,
          // Only send cookie over HTTPS in production
          secure: process.env.NODE_ENV === "production",
          // 30 days
          maxAge: LONG_EXPIRE_TIME,
        })
        .status(200)
        .json({ email: result.data.email });
    } else if (req.body.mode === "hybrid") {
      // Create refresh token
      const refreshToken = createToken(
        { email },
        result.data.id,
        process.env.JWT_SECRET,
        LONG_EXPIRE_TIME
      );

      // Create access token
      const accessToken = createToken(
        { email },
        result.data.id,
        process.env.JWT_ACCESS_SECRET,
        SHORT_EXPIRE_TIME
      );

      const tokenResult = await storeTokens({
        accessToken,
        refreshToken,
        userId: result.data.id,
      });

      if (tokenResult._tag === "Failure") {
        res.status(500).json({ error: tokenResult.error });
        return;
      }

      return res
        .cookie("token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: LONG_EXPIRE_TIME,
        })
        .status(200)
        .json({
          accessToken,
          email: result.data.email,
        });
    }

    // Else is statefull
    // TODO: Statefull session
    return res.status(200).json({ message: result.data });
  }
);

// Handle stateful authentication
router.post("/logout", validateLogout, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // If it is only simple mode for logout just delete cookie
  if (req.body.mode === "stateless_simple") {
    return res.clearCookie("token").status(200).json({ message: "Logged out" });
  } else if (req.body.mode === "hybrid") {
    return res.status(200).json({ message: "Logged out" });
  }

  // Else is statefull
  return res.status(200).json({ message: "Logged out" });
});

export default router;
