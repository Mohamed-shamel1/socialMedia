import { resolve } from "node:path";
import { config } from "dotenv";
config({ path: resolve("./config/.env.development") });
import type { Request, Express, Response } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import { userRouter, authRouter, postRouter, initializeIo } from "./modules";
import conectDB from "./DB/conection.db";
import { glopelErrorHandleing } from "./utils/response/error.response";
import { chatRouter } from "./modules/chat";



const bootstrap = async (): Promise<void> => {
  const app: Express = express();
  const port: number | string = process.env.PORT || 5000;
  app.use(cors());
  app.use(express.json());
  app.use(helmet());
  const limiter = rateLimit({
    windowMs: 60 * 60000,
    limit: 2000,
    message: { error: "Too mny requst please try again" },
    statusCode: 429,
  });
  app.use(limiter);
  // app routing

  app.get("/", (req: Request, res: Response) => {
    res.json(
      `welcome in ${process.env.APPLICATION_NAME} in lainding page ❤️😍`
    );
  });
  // modules
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/post", postRouter);
  app.use("/chat", chatRouter);

  app.use("{/*dummy}", (req: Request, res: Response) => {
    return res
      .status(409)
      .json({ message: "invalide app routing plz cheak methode or url ❌" });
  });

  app.use(glopelErrorHandleing);
  // DB
  await conectDB();

  const httpServer = app.listen(port, () => {
    console.log(`Server is ruining on port::: ${port} ❤️`);
  });
  

  initializeIo(httpServer)
};
export default bootstrap;
