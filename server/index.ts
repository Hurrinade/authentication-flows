import express from "express";
import authRouter from "./routers/authentication";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use("/api/v1", authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
