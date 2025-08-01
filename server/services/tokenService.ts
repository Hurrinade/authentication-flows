import { prisma } from "../index";
import { Result, ok, err } from "../types/return";
import { UserToken } from "@prisma/client";

export const storeTokens = async (data: {
  refreshToken: string;
  userId: string;
}): Promise<Result<string, string>> => {
  try {
    await prisma.userToken.create({
      data: {
        refreshToken: data.refreshToken,
        uid: data.userId,
      },
    });

    return ok("Tokens stored");
  } catch (error) {
    console.error("Tokens storage failed", error);
    return err("Tokens storage failed");
  }
};

export const updateToken = async (data: {
  refreshToken: string;
  userId: string;
}): Promise<Result<string, string>> => {
  try {
    await prisma.userToken.update({
      where: { uid: data.userId },
      data: {
        refreshToken: data.refreshToken,
      },
    });

    return ok("Tokens updated");
  } catch (error) {
    console.error("Tokens update failed", error);
    return err("Tokens update failed");
  }
};

export const getUserToken = async (
  userId: string
): Promise<Result<UserToken, string>> => {
  try {
    const token = await prisma.userToken.findUnique({
      where: { uid: userId },
    });

    if (!token) {
      return err("Token not found");
    }

    return ok(token);
  } catch (error) {
    console.error(error);
    return err("Token retrieval failed");
  }
};
