import { model, Schema, Types } from "mongoose";
//schema
const postSchema = new Schema(
  {
    content: {
      type: String,
      required: function () {
        return this.attachments.length == 0;
      },
    },
    attachments: [{ secure_url: String, public_id: String }],
    publisher: { type: Types.ObjectId, ref: "User", required: true },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});
//model
export const Post = model("Post", postSchema);
