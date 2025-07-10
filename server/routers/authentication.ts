import { Router, Request, Response } from "express";
import { validateLogin, validateRegister } from "../middlwares/validations";
import { validationResult } from "express-validator";
import { createUser } from "../services/userService";

const router: Router = Router();

// Handle stateless authentication
router.post("/logout-stateless", (req: Request, res: Response) => {
  console.log("logout-stateless", req.body);
  res.send("Hello World Logout");
});

router.post(
  "/login-stateless",
  validateLogin,
  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

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

router.post("/login-stateful", validateLogin, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  console.log("login-stateful", req.body);
  res.send("Hello World Login");
});

router.post(
  "/register-stateful",
  validateRegister,
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    console.log("register-stateful", req.body);
    res.send("Hello World Register");
  }
);

export default router;
