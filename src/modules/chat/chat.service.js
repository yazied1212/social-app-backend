import { Chat } from "../../db/models/chat.js";

export const getAllChat = async (req, res, next) => {
  const { friendId } = req.params;
  const chat = await Chat.findOne({
    users: { $all: [friendId, req.authUser._id] },
  }).populate([
    { path: "users" },
    { path: "messages.sender", select: "userName" },
  ]);

  return res.status(200).json({
    success: true,
    data: { chat },
  });
};
