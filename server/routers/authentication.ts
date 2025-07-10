import { Router, Request, Response } from "express";

const router: Router = Router();

// Handle stateless authentication
router.post("/logout-stateless", (req: Request, res: Response) => {
  console.log("logout-stateless", req.body);
  res.send("Hello World Logout");
});

router.post("/login-stateless", (req, res) => {
  console.log("login-stateless", req.body);
  res.send("Hello World Login");
});

router.post("/register-stateless", (req, res) => {
  console.log("register-stateless", req.body);
  res.send("Hello World Register");
});

// Handle stateful authentication
router.post("/logout-stateful", (req, res) => {
  console.log("logout-stateful", req.body);
  res.send("Hello World Logout");
});

router.post("/login-stateful", (req, res) => {
  console.log("login-stateful", req.body);
  res.send("Hello World Login");
});

router.post("/register-stateful", (req, res) => {
  console.log("register-stateful", req.body);
  res.send("Hello World Register");
});

export default router;
