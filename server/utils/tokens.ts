import jwt, { JwtPayload } from "jsonwebtoken";
import { Result, ok, err } from "../types/return";
import { TOKEN_SHORT_EXPIRE_TIME, TOKEN_LONG_EXPIRE_TIME } from "./constants";
import { getUserToken, updateToken } from "../services/tokenService";

// Function to create a new token with a given secret and expiration time, audience and data
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

// Function to create a new refresh and access token with a given secret and expiration time, audience and data
export function createTokens(userId: string, data: Record<string, any>) {
  const refreshToken = createToken(
    data,
    userId,
    process.env.JWT_SECRET!,
    TOKEN_LONG_EXPIRE_TIME
  );

  // Create access token
  const accessToken = createToken(
    data,
    userId,
    process.env.JWT_ACCESS_SECRET!,
    TOKEN_SHORT_EXPIRE_TIME
  );

  return {
    refreshToken,
    accessToken,
  };
}

// Function to verify a token with a given secret
export function verifyToken(
  token: string,
  jwtSecret: string
): Result<JwtPayload, string> {
  try {
    if (!jwtSecret) {
      return err("JWT_SECRET is not set");
    }

    const decoded = jwt.verify(token, jwtSecret);

    return ok(decoded as JwtPayload);
  } catch (error) {
    return err("Invalid token");
  }
}

export async function reissueAccessToken(
  refreshToken: string
): Promise<Result<{ accessToken: string; refreshToken: string }, string>> {
  if (!process.env.JWT_SECRET || !process.env.JWT_ACCESS_SECRET) {
    console.error(
      "<tokens.ts>(reissueAccessToken)[ERROR] JWT_SECRET or JWT_ACCESS_SECRET is not set"
    );
    return err("JWT_SECRET or JWT_ACCESS_SECRET is not set");
  }

  try {
    // Check if refresh token is valid
    const decoded = jwt.decode(refreshToken);
    const userId = (decoded as JwtPayload).aud;

    // If aud is missing token is invalid
    if (!userId) {
      console.error(
        "<tokens.ts>(reissueAccessToken)[ERROR] User ID is missing from aud"
      );
      return err("Token invalid");
    }

    const userToken = await getUserToken(userId as string);

    // If there is internal error or token is not found token is invalid
    if (userToken._tag === "Failure") {
      console.error(
        "<tokens.ts>(reissueAccessToken)[ERROR] User token not found"
      );
      return err("Token invalid");
    }
    // If token is not the same as the one in db token is invalid
    if (userToken.data.refreshToken !== refreshToken) {
      console.error(
        "<tokens.ts>(reissueAccessToken)[ERROR] User token is not the same as the one in db"
      );
      return err("Token invalid");
    }

    const email = (decoded as JwtPayload).email;

    // Create new tokens
    const { refreshToken: newRefreshToken, accessToken: newAccessToken } =
      createTokens(String(userId), { email });

    // To reduce surface of attack refresh the refresh token as well
    const storeResult = await updateToken({
      refreshToken: newRefreshToken,
      userId: String(userId),
    });

    if (storeResult._tag === "Failure") {
      console.error(
        "<tokens.ts>(reissueAccessToken)[ERROR] Token storing failed"
      );
      return err("Token storing failed");
    }

    // Create new access token
    return ok({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error(
      "<tokens.ts>(reissueAccessToken)[ERROR] Invalid refresh token",
      error
    );
    return err("Invalid refresh token");
  }
}
