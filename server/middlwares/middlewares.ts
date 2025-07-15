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

// Check for refresh token and for simple stateless token
export const checkAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    console.error(
      "<middlewares.ts>(checkAccessToken)[ERROR] No authorization header"
    );
    return res.status(401).json({ data: "Unauthorized", error: true });
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    console.error("<middlewares.ts>(checkAccessToken)[ERROR] No token");
    return res.status(401).json({ data: "Unauthorized", error: true });
  }

  const result = verifyToken(token, process.env.JWT_ACCESS_SECRET!);

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

export const checkSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if session has user id which makes it valid and statefull
  if (!(req.session as any)?.userId || !(req.session as any)?.email) {
    console.error("<middlewares.ts>(check-session)[ERROR] Session is invalid");
    return res
      .status(401)
      .json({ data: "Missing Session (session invalid)", error: true });
  }

  return next();
};
