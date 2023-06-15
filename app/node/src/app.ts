import express from "express";
import cookieParser from "cookie-parser";
import { sessionRouter } from "./routes/session/controller";
import { checkAuthMiddleware } from "./middleware/auth";
import { usersRouter } from "./routes/users/controller";
import { matchGroupRouter } from "./routes/match-groups/controller";

export const app: express.Express = express();

app.use(express.json());
app.use(cookieParser());

// ログインしているかチェック
app.use(checkAuthMiddleware);

// session
app.use("/api/v1/session", sessionRouter);

// users
app.use("/api/v1/users", usersRouter);

// match-groups
app.use("/api/v1/match-groups", matchGroupRouter);

// 共通のエラー処理
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    // リクエストボディがJSON形式でない場合
    if (
      err instanceof SyntaxError &&
      "status" in err &&
      err.status === 400 &&
      "body" in err
    ) {
      res
        .status(400)
        .json({ message: "リクエストボディがJSON形式ではありません。" });
      console.warn(err);
      return;
    }
    res.status(500).json({ message: "Internal Server Error" });
    console.error(err);
  }
);
