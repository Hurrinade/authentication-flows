import { body } from "express-validator";

export const validateLogin = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("mode").isIn(["stateless_simple", "hybrid", "statefull"]),
];

export const validateRegister = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("mode").isIn(["stateless_simple", "hybrid", "statefull"]),
];

export const validateLogout = [
  body("mode").isIn(["stateless_simple", "hybrid", "statefull"]),
];
