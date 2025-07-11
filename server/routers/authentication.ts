import { Router, Request, Response } from "express";
import { validateLogin, validateRegister } from "../middlwares/validations";
import { validationResult } from "express-validator";
import { createUser, getUser } from "../services/userService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

  if (!process.env.JWT_SECRET) {
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
    const token = jwt.sign(
      { email, userId: user.data.id },
      process.env.JWT_SECRET
    );

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      })
      .status(200)
      .json({ email: user.data.email, userId: user.data.id });
  } else if (req.body.mode === "stateless_refresh") {
    return res.send("Login refresh");
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

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: "JWT_SECRET is not set" });
      return;
    }

    // TODO: Create token, ...
    if (req.body.mode === "stateless_simple") {
      const token = jwt.sign(
        { email, userId: result.data.id },
        process.env.JWT_SECRET
      );

      return res
        .cookie("token", token, {
          // Only accessible by the web server
          httpOnly: true,
          // Only send cookie over HTTPS in production
          secure: process.env.NODE_ENV === "production",
          // 30 days
          maxAge: 1000 * 60 * 60 * 24 * 30,
        })
        .status(200)
        .json({ email: result.data.email, userId: result.data.id });
    } else if (req.body.mode === "stateless_refresh") {
      return res.status(200).json({ message: result.data });
    }

    // Else is statefull
    return res.status(200).json({ message: result.data });
  }
);

// Handle stateful authentication
router.post("/logout", (req, res) => {
  console.log("logout-stateful", req.body);
  res.send("Hello World Logout");
});

export default router;
