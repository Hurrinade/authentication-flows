import express from "express";
import authRouter from "./routers/authentication";
import resourcesRouter from "./routers/resources";
import cookieParser from "cookie-parser";
import session from "express-session";
import { PrismaClient } from "@prisma/client";
import { LONG_EXPIRE_TIME } from "./utils/constants";
import cors from "cors";
import "dotenv/config";

// Global prisma client
export const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3001;

// CORS
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
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
  })
);
app.use("/api/v1", authRouter);
app.use("/api/v1", resourcesRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
