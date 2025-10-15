import { isConnected } from "./db/connect.js";
import { errorHandler, notFound } from "./utils/index.js";
import authRouter from "./modules/auth/auth.controller.js";
import usersRouter from "./modules/users/users.controller.js";
import postsRouter from "./modules/posts/posts.controller.js";
import commentsRouter from "./modules/comments/comments.controller.js";
import adminRouter from "./modules/admin/admin.controller.js";
import chatRouter from "./modules/chat/chat.controller.js";
import cors from "cors";

export const bootStrap = async (app, express) => {
  app.use(cors("*"));

  //parse
  app.use(express.json());

  //check for db connection
  await isConnected();

  //routers
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/posts", postsRouter);
  app.use("/comments", commentsRouter);
  app.use("/admin", adminRouter);
  app.use("/chat", chatRouter);

  //invalid url
  app.all("*", notFound);

  //error handler
  app.use(errorHandler);
};
