import { prisma } from "../index";
import { Result, ok, err } from "../types/return";

export const storeTokens = async (data: {
  accessToken: string;
  refreshToken: string;
  userId: string;
}): Promise<Result<string, string>> => {
  try {
    await prisma.userToken.create({
      data: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        id: data.userId,
      },
    });

    return ok("Tokens stored");
  } catch (error) {
    console.error(error);
    return err("Tokens storage failed");
  }
};
