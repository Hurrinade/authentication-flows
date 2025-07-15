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
import { checkToken } from "../middlwares/middlewares";
import jwt, { JwtPayload } from "jsonwebtoken";

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
    res.status(400).json({ data: "Validation failed", error: true });
    return;
  }

  // Check if user exists
  const { email, password } = req.body;
  const user = await getUser(email);

  if (user._tag === "Failure") {
    console.error("<authentication.ts>(login)[ERROR] User not found");
    res.status(400).json({ data: "User not found", error: true });
    return;
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_ACCESS_SECRET) {
    console.error("<authentication.ts>(login)[ERROR] JWT_SECRET is not set");
    res.status(500).json({ data: "JWT_SECRET is not set", error: true });
    return;
  }

  // Check user password if it matches hashed password
  const hashedPassword = user.data.password;
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);

  if (!isPasswordValid) {
    console.error("<authentication.ts>(login)[ERROR] Invalid password");
    res.status(400).json({ data: "Invalid password", error: true });
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
      .json({
        data: { email: user.data.email },
        error: false,
      });
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
      res.status(500).json({ data: "Token storing failed", error: true });
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
        data: { email: user.data.email, accessToken },
        error: false,
      });
  }
  // Statefull with session
  (req.session as any).userId = user.data.id;
  (req.session as any).email = user.data.email;

  return res.status(200).json({
    data: { email: user.data.email },
    error: false,
  });
});

router.post(
  "/register",
  validateRegister,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("<authentication.ts>(register)[ERROR] Validation failed");
      res.status(400).json({ data: "Validation failed", error: true });
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
      res.status(400).json({ data: "User creation failed", error: true });
      return;
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_ACCESS_SECRET) {
      console.error(
        "<authentication.ts>(register)[ERROR] JWT_SECRET or JWT_ACCESS_SECRET is not set"
      );
      res.status(500).json({
        data: "JWT_SECRET or JWT_ACCESS_SECRET is not set",
        error: true,
      });
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
        .json({ data: { email: user.data.email }, error: false });
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
        res.status(500).json({ data: "Token storing failed", error: true });
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
          data: { email: user.data.email, accessToken },
          error: false,
        });
    }

    // Statefull with session
    (req.session as any).userId = user.data.id;
    (req.session as any).email = user.data.email;

    return res.status(200).json({
      data: { email: user.data.email },
      error: false,
    });
  }
);

// Handle stateful authentication
router.post("/logout", validateLogout, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("<authentication.ts>(logout)[ERROR] Validation failed");
    res.status(400).json({ data: "Validation failed", error: true });
    return;
  }

  // If it is only simple mode for logout just delete cookie
  if (req.body.mode === "stateless_simple") {
    return res
      .clearCookie("token")
      .status(200)
      .json({ data: "Logged out", error: false });
  } else if (req.body.mode === "hybrid") {
    const refreshToken = req.cookies["token"];
    const payloadResult = verifyToken(refreshToken, process.env.JWT_SECRET!);

    if (payloadResult._tag === "Failure") {
      console.error("<authentication.ts>(logout)[ERROR] Invalid token");
      res.status(401).json({ data: "Invalid token", error: true });
      return;
    }

    const userId = payloadResult.data.aud as string;

    const tokenResult = await updateToken({
      refreshToken: "",
      userId,
    });

    if (tokenResult._tag === "Failure") {
      console.error("<authentication.ts>(logout)[ERROR] Token update failed");
      res.status(500).json({ data: "Token update failed", error: true });
      return;
    }

    res
      .clearCookie("token")
      .status(200)
      .json({ data: "Logged out", error: false });
    return;
  }

  // Statefull with session
  req.session.destroy((err) => {
    if (err) {
      console.error(
        "<authentication.ts>(logout)[ERROR] Session destruction failed"
      );
      return res.status(500).json({ data: err.message, error: true });
    }

    return res
      .clearCookie("connect.sid")
      .status(200)
      .json({ data: "Logged out", error: false });
  });

  return;
});

// Refresh access token
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies["token"];
    const result = await reissueAccessToken(refreshToken);

    if (result._tag === "Failure") {
      console.error("<authentication.ts>(refresh)[ERROR] Token reissue failed");
      return res
        .clearCookie("token")
        .status(401)
        .json({ data: "Token reissue failed", error: true });
    }

    return res
      .cookie("token", result.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: LONG_EXPIRE_TIME,
      })
      .status(200)
      .json({
        data: { accessToken: result.data.accessToken },
        error: false,
      });
  } catch (error) {
    console.error("<authentication.ts>(refresh)[ERROR] Internal server error");
    return res
      .clearCookie("token")
      .status(500)
      .json({ data: "Internal server error", error: true });
  }
});

// Check if token is valid
router.get(
  "/check-refresh-token",
  [checkToken],
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies["token"];
    // Just decode no need to verify because middleware already did it
    const payload = jwt.decode(refreshToken);
    const dbRefreshToken = await getUserToken(
      (payload as JwtPayload).aud as string
    );

    if (dbRefreshToken._tag === "Failure") {
      console.error("<authentication.ts>(check-token)[ERROR] Token not found");
      return res.status(401).json({ data: "Token not found", error: true });
    }

    if (dbRefreshToken.data.refreshToken !== refreshToken) {
      console.error("<authentication.ts>(check-token)[ERROR] Token mismatch");
      return res.status(401).json({ data: "Unauthorized", error: true });
    }

    const user = await getUser((payload as JwtPayload).email as string);

    if (user._tag === "Failure") {
      console.error("<authentication.ts>(check-token)[ERROR] User not found");
      return res.status(404).json({ data: "User not found", error: true });
    }

    return res
      .status(200)
      .json({ data: { email: user.data.email }, error: false });
  }
);

router.get("/user", [checkToken], async (req: Request, res: Response) => {
  const token = req.cookies["token"];
  const payload = jwt.decode(token);

  const result = await getUser((payload as JwtPayload).email as string);

  if (result._tag === "Failure") {
    console.error("<authentication.ts>(user)[ERROR] User not found");
    return res.status(404).json({ data: "User not found", error: true });
  }

  return res
    .status(200)
    .json({ data: { email: result.data.email }, error: false });
});

// Check if session is valid
router.get("/check-session", async (req: Request, res: Response) => {
  if ((req.session as any).userId) {
    // Get user from db
    const user = await getUser((req.session as any).email);

    if (user._tag === "Failure") {
      console.error("<authentication.ts>(check-session)[ERROR] User not found");
      return res.status(404).json({ data: "User not found", error: true });
    }

    return res
      .status(200)
      .json({ data: { email: user.data.email }, error: false });
  }
  console.error("<authentication.ts>(check-session)[ERROR] User not found");
  return res.status(401).json({ data: "Unauthorized", error: true });
});

export default router;
