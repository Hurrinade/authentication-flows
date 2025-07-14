import express from "express";
import authRouter from "./routers/authentication";
import cookieParser from "cookie-parser";
import session from "express-session";
import { PrismaClient } from "./generated/prisma";
import { LONG_EXPIRE_TIME } from "./utils/constants";
import cors from "cors";
import "dotenv/config";

// Global prisma client
export const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3001;

// CORS
app.use(cors());
// Parse JSON body
app.use(express.json());
// Parse cookies
app.use(cookieParser());
// Session handling
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: LONG_EXPIRE_TIME,
    },
    resave: true,
    saveUninitialized: false,
  }),
);
app.use("/api/v1", authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
