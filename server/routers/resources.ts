import { Router, Request, Response } from "express";
import { checkSession, checkToken } from "../middlwares/middlewares";

const router: Router = Router();

// Protected route for simple stateless token
router.get("/resources", [checkToken], (_: Request, res: Response) => {
  // Random resources
  const resources = [
    { id: Math.floor(Math.random() * 100000) + 1, name: "Resource 1" },
    { id: Math.floor(Math.random() * 100000) + 2, name: "Resource 2" },
    { id: Math.floor(Math.random() * 100000) + 3, name: "Resource 3" },
  ];
  res.status(200).json({ data: resources, error: false });
});

// Protected route for simple stateless token
router.get(
  "/session-resources",
  [checkSession],
  (_: Request, res: Response) => {
    // Random resources
    const resources = [
      { id: Math.floor(Math.random() * 100000) + 1, name: "Resource 1" },
      { id: Math.floor(Math.random() * 100000) + 2, name: "Resource 2" },
      { id: Math.floor(Math.random() * 100000) + 3, name: "Resource 3" },
    ];
    res.status(200).json({ data: resources, error: false });
  }
);

export default router;
