import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/tokens";

// Check for refresh token and for simple stateless token
export const checkToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["token"];
  const result = verifyToken(token, process.env.JWT_SECRET!);

  if (result._tag === "Failure") {
    console.error("<middlewares.ts>(checkToken)[ERROR] Verify Failed");
    return res.status(401).json({ data: "Token is invalid", error: true });
  }

  // If there is no user id in the token it is invalid
  if (!result.data.aud) {
    console.error("<middlewares.ts>(checkToken)[ERROR] No user id in token");
    return res.status(401).json({ data: "Unauthorized", error: true });
  }

  return next();
};
