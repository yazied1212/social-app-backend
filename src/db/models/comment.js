//schema
import { Schema, Types, model } from "mongoose";
import cloudinary from "../../utils/multer/cloud-config.js";

const commentSchema = new Schema(
  {
    post: { type: Types.ObjectId, ref: "Post", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    parentComment: { type: Types.ObjectId, ref: "Comment" },
    text: {
      type: String,
      required: function () {
        return this.attachment ? false : true;
      },
    },
    attachment: { secure_url: String, public_id: String },
    likes: [{ type: Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

commentSchema.post(
  "deleteOne",
  { query: false, document: true },

  async function (doc, next) {
    const replies = await this.constructor.find({ parentComment: doc._id });
    if (replies.length) {
      for (const reply of replies) {
        if (reply.attachment.public_id) {
          await cloudinary.uploader.destroy(reply.attachment.public_id);
        }
        await reply.deleteOne();
      }
    }
    return next();
  },
);

//model
export const Comment = model("Comment", commentSchema);
