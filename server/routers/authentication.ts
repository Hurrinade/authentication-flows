import { Router, Request, Response } from "express";
import { validateLogin, validateRegister } from "../middlwares/validations";
import { validationResult } from "express-validator";
import { createUser, getUser } from "../services/userService";

const router: Router = Router();

// Handle stateless authentication
router.post("/logout-stateless", (req: Request, res: Response) => {
  console.log("logout-stateless", req.body);
  res.send("Hello World Logout");
});

router.post(
  "/login-stateless",
  validateLogin,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Check if user exists
    const { email } = req.body;
    const user = await getUser(email);

    if (user._tag === "Failure") {
      res.status(400).json({ error: user.error });
      return;
    }

    // TODO: Check user password

    // TODO: Check if token is active, means user is logged in

    // TODO: If user is not logged in, create token...

    console.log("login-stateless", req.body);
    res.send("Hello World Login");
  }
);

router.post(
  "/register-stateless",
  validateRegister,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    const result = await createUser({ email, password });

    if (result._tag === "Failure") {
      res.status(400).json({ error: result.error });
      return;
    }

    // TODO: Create token, ...

    res.status(200).json({ message: result.data });
  }
);

// Handle stateful authentication
router.post("/logout-stateful", (req, res) => {
  console.log("logout-stateful", req.body);
  res.send("Hello World Logout");
});

router.post(
  "/login-stateful",
  validateLogin,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Check if user exists
    const { email } = req.body;
    const user = await getUser(email);

    if (user._tag === "Failure") {
      res.status(400).json({ error: user.error });
      return;
    }

    // TODO: Check user password

    // TODO: Check if session is active, means user is logged in

    // TODO: If user is not logged in, create session...

    res.send("Hello World Login");
  }
);

router.post(
  "/register-stateful",
  validateRegister,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    const result = await createUser({ email, password });

    if (result._tag === "Failure") {
      res.status(400).json({ error: result.error });
      return;
    }

    // TODO: Create session, store session...

    res.status(200).json({ message: result.data });
  }
);

export default router;
