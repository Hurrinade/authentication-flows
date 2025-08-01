import { User } from "@prisma/client";
import { prisma } from "../index";
import { Result, ok, err } from "../types/return";

/**
 * User service
 *
 * This service is responsible for creating and getting users.
 * This are pure function and they don't do any validation.
 *
 * It is used by the authentication router to create and get users.
 *
 */

// Create new user
export const createUser = async (
  user: Omit<User, "id">
): Promise<Result<User, string>> => {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
      },
    });

    return ok(newUser);
  } catch (error) {
    console.error(error);
    return err("User creation failed");
  }
};

// Function to check user credentials
export const getUser = async (email: string): Promise<Result<User, string>> => {
  try {
    // Get user by email
    const foundUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // Validate user
    if (!foundUser) {
      return err("User not found");
    }

    return ok(foundUser);
  } catch (error) {
    console.error(error);
    return err("User get failed");
  }
};
