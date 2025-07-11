import express from "express";
import authRouter from "./routers/authentication";
import cookieParser from "cookie-parser";
import { PrismaClient } from "./generated/prisma";
import "dotenv/config";

// Global prisma client
export const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3001;

// Parse JSON body
app.use(express.json());
// Parse cookies
app.use(cookieParser());
app.use("/api/v1", authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
