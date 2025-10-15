import express from "express";
import { bootStrap } from "./src/app.controller.js";
import { initSocket } from "./src/socket.io/index.js";
const app = express();
const port = 3000;
bootStrap(app, express);
const server = app.listen(port, () =>
  console.log(`social app listening on port`, port),
);
initSocket(server);
