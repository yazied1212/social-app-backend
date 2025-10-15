import { Chat } from "../../db/models/chat.js";

export const sendMessage = (socket, io) => {
  return async (data) => {
    const { message, destId } = data;
    socket.to(destId).emit("receiveMessage", { message });

    const chat = await Chat.findOne({ users: { $all: [destId, socket.Id] } });
    if (chat) {
      await Chat.updateOne(
        { users: { $all: [destId, socket.id] } },
        { $push: { messages: { sender: socket.id, message } } },
      );
    } else {
      await Chat.create({
        users: [destId, socket.id],
        messages: [{ sender: socket.id, message }],
      });
    }
  };
};
