import { Router, Request, Response } from "express";
import {
  validateLogin,
  validateRegister,
  validateLogout,
} from "../middlwares/validations";
import { LONG_EXPIRE_TIME } from "../utils/constants";
import { createToken, createTokens, verifyToken } from "../utils/tokens";
import { validationResult } from "express-validator";
import { createUser, getUser } from "../services/userService";
import bcrypt from "bcrypt";
import {
  getUserToken,
  storeTokens,
  updateToken,
} from "../services/tokenService";
import { reissueAccessToken } from "../utils/tokens";

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
    console.error("<authentication.ts>(login)[ERROR] Validation failed");
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Check if user exists
  const { email, password } = req.body;
  const user = await getUser(email);

  if (user._tag === "Failure") {
    console.error("<authentication.ts>(login)[ERROR] User not found");
    res.status(400).json({ error: user.error });
    return;
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_ACCESS_SECRET) {
    console.error("<authentication.ts>(login)[ERROR] JWT_SECRET is not set");
    res.status(500).json({ error: "JWT_SECRET is not set" });
    return;
  }

  // Check user password if it matches hashed password
  const hashedPassword = user.data.password;
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);

  if (!isPasswordValid) {
    console.error("<authentication.ts>(login)[ERROR] Invalid password");
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
    // Create tokens
    const { refreshToken, accessToken } = createTokens(user.data.id, { email });

    // Update tokens
    const tokenResult = await updateToken({
      refreshToken,
      userId: user.data.id,
    });

    if (tokenResult._tag === "Failure") {
      console.error("<authentication.ts>(login)[ERROR] Token storing failed");
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
  // Statefull with session
  (req.session as any).userId = user.data.id;
  (req.session as any).email = user.data.email;

  return res.status(200).json({
    email: user.data.email,
    message: "Login statefull",
  });
});

router.post(
  "/register",
  validateRegister,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("<authentication.ts>(register)[ERROR] Validation failed");
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Salt and hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await createUser({ email, password: hashedPassword });

    if (user._tag === "Failure") {
      console.error(
        "<authentication.ts>(register)[ERROR] User creation failed"
      );
      res.status(400).json({ error: user.error });
      return;
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_ACCESS_SECRET) {
      console.error(
        "<authentication.ts>(register)[ERROR] JWT_SECRET or JWT_ACCESS_SECRET is not set"
      );
      res
        .status(500)
        .json({ error: "JWT_SECRET or JWT_ACCESS_SECRET is not set" });
      return;
    }

    if (req.body.mode === "stateless_simple") {
      const token = createToken(
        { email },
        user.data.id,
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
        .json({ email: user.data.email });
    } else if (req.body.mode === "hybrid") {
      // Create tokens
      const { refreshToken, accessToken } = createTokens(user.data.id, {
        email,
      });

      // Store tokens
      const tokenResult = await storeTokens({
        refreshToken,
        userId: user.data.id,
      });

      if (tokenResult._tag === "Failure") {
        console.error(
          "<authentication.ts>(register)[ERROR] Token storing failed"
        );
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

    // Statefull with session
    (req.session as any).userId = user.data.id;
    (req.session as any).email = user.data.email;

    return res.status(200).json({
      email: user.data.email,
      message: "Register statefull",
    });
  }
);

// Handle stateful authentication
router.post("/logout", validateLogout, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("<authentication.ts>(logout)[ERROR] Validation failed");
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // If it is only simple mode for logout just delete cookie
  if (req.body.mode === "stateless_simple") {
    return res.clearCookie("token").status(200).json({ message: "Logged out" });
  } else if (req.body.mode === "hybrid") {
    const refreshToken = req.cookies["token"];
    const payloadResult = verifyToken(refreshToken);

    if (payloadResult._tag === "Failure") {
      console.error("<authentication.ts>(logout)[ERROR] Invalid token");
      res.status(401).json({ error: payloadResult.error });
      return;
    }

    const userId = payloadResult.data.aud as string;

    const tokenResult = await updateToken({
      refreshToken: "",
      userId,
    });

    if (tokenResult._tag === "Failure") {
      console.error("<authentication.ts>(logout)[ERROR] Token update failed");
      res.status(500).json({ error: tokenResult.error });
      return;
    }

    res.clearCookie("token").status(200).json({ message: "Logged out" });
    return;
  }

  // Statefull with session
  req.session.destroy((err) => {
    if (err) {
      console.error(
        "<authentication.ts>(logout)[ERROR] Session destruction failed"
      );
      return res.status(500).json({ error: err.message });
    }

    return res
      .clearCookie("connect.sid")
      .status(200)
      .json({ message: "Logged out" });
  });

  return;
});

router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies["token"];
    const result = await reissueAccessToken(refreshToken);

    if (result._tag === "Failure") {
      console.error("<authentication.ts>(refresh)[ERROR] Token reissue failed");
      return res.clearCookie("token").status(401).json({ error: result.error });
    }

    return res
      .cookie("token", result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: LONG_EXPIRE_TIME,
      })
      .status(200)
      .json({ accessToken: result.data.accessToken });
  } catch (error) {
    console.error("<authentication.ts>(refresh)[ERROR] Internal server error");
    return res
      .clearCookie("token")
      .status(500)
      .json({ error: "Internal server error" });
  }
});

router.get("/check-token", async (req: Request, res: Response) => {
  const refreshToken = req.cookies["token"];
  const result = verifyToken(refreshToken);

  if (result._tag === "Failure") {
    console.error("<authentication.ts>(check-token)[ERROR] Verify Failed");
    return res.status(401).json({ error: result.error });
  }

  // If there is no user id in the token it is invalid
  if (!result.data.aud) {
    console.error(
      "<authentication.ts>(check-token)[ERROR] No user id in token"
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  const dbRefreshToken = await getUserToken(result.data.aud as string);

  if (dbRefreshToken._tag === "Failure") {
    console.error("<authentication.ts>(check-token)[ERROR] Token not found");
    return res.status(401).json({ error: dbRefreshToken.error });
  }

  if (dbRefreshToken.data.refreshToken !== refreshToken) {
    console.error("<authentication.ts>(check-token)[ERROR] Token mismatch");
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.status(200).json({ message: "User is logged in" });
});

router.get("/check-session", async (req: Request, res: Response) => {
  if ((req.session as any).userId) {
    // Get user from db
    const user = await getUser((req.session as any).email);

    if (user._tag === "Failure") {
      return res.status(401).json({ error: user.error });
    }

    return res.status(200).json({ message: "User logged in" });
  }
  return res.status(401).json({ error: "Unauthorized" });
});

export default router;
