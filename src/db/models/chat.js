import { model, Schema, Types } from "mongoose";

//message schema
const messageSchema = new Schema(
  {
    sender: { type: Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { versionKey: false, timestamps: true },
);

//chat schema
const chatSchema = new Schema(
  {
    users: [{ type: Types.ObjectId, ref: "User", required: true }],
    messages: [messageSchema],
  },
  { versionKey: false, timestamps: true },
);

//model
export const Chat = model("Chat", chatSchema);
