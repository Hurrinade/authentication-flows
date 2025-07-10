import { Router, Request, Response } from "express";
import { validateLogin, validateRegister } from "../middlwares/validations";
import { validationResult } from "express-validator";

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
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    console.log("register-stateless", req.body);
    res.send("Hello World Register");
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
