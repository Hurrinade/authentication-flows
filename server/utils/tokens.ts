import jwt, { JwtPayload } from "jsonwebtoken";
import { Result, ok, err } from "../types/return";
import { SHORT_EXPIRE_TIME } from "./constants";

export function createToken(
  data: any,
  userId: string,
  jwtSecret: string,
  expireTime: number
) {
  return jwt.sign(data, jwtSecret, {
    expiresIn: expireTime,
    audience: userId,
  });
}

export function verifyToken(token: string): Result<string, string> {
  try {
    if (!process.env.JWT_SECRET) {
      return err("JWT_SECRET is not set");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = (decoded as JwtPayload).aud as string;

    return ok(userId);
  } catch (error) {
    return err("Invalid token");
  }
}

// TODO: upgrade to check db
export function reissueAccessToken(
  refreshToken: string
): Result<string, string> {
  if (!process.env.JWT_SECRET || !process.env.JWT_ACCESS_SECRET) {
    return err("JWT_SECRET or JWT_ACCESS_SECRET is not set");
  }

  try {
    // Check if refresh token is valid
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const userId = (decoded as JwtPayload).aud;
    const email = (decoded as JwtPayload).email;

    // Create new access token
    return ok(
      createToken(
        { email },
        String(userId),
        process.env.JWT_ACCESS_SECRET,
        SHORT_EXPIRE_TIME
      )
    );
  } catch (error) {
    return err("Invalid refresh token");
  }
}
