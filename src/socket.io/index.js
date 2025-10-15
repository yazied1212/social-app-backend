import { Server } from "socket.io";
import { sendMessage } from "./chat/index.js";
import { socketAuth } from "./middleware/auth.socket.js";

export const initSocket = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });
  io.use(socketAuth);
  io.on("connection", (socket) => {
    socket.on("sendMessage", sendMessage(socket, io));
  });
};
