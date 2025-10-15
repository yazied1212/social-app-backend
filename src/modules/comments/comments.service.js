import { Post } from "../../db/models/post.js";
import { Comment } from "../../db/models/comment.js";
import { messages } from "../../utils/index.js";
import cloudinary from "../../utils/multer/cloud-config.js";

//create comment
export const CreateComment = async (req, res, next) => {
  const { postId, id } = req.params;
  const { text } = req.body;

  const PostExists = await Post.findById(postId);
  if (!PostExists) {
    return next(new Error(messages.post.notFound, { cause: 404 }));
  }

  let attachments = {};
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `social-app/posts/${PostExists._id}/comments` },
    );
    attachments = { secure_url, public_id };
  }

  const createdComment = await Comment.create({
    post: postId,
    user: req.authUser._id,
    text,
    attachment: attachments,
    parentComment: id,
  });

  return res.status(201).json({
    success: true,
    data: createdComment,
  });
};

//get comments
export const getComments = async (req, res, next) => {
  const { postId, id } = req.params;

  const PostExists = await Post.findById(postId);
  if (!PostExists) {
    return next(new Error(messages.post.notFound, { cause: 404 }));
  }

  const comments = await Comment.find({
    post: postId,
    parentComment: id,
  }).populate([
    { path: "user", select: "userName profilePictureCloud.secure_url" },
  ]);

  return res.status(200).json({
    success: true,
    data: comments,
  });
};

//delete comment
export const deleteComment = async (req, res, next) => {
  const { postId, id } = req.params;

  const PostExists = await Post.findById(postId);
  if (!PostExists) {
    return next(new Error(messages.post.notFound, { cause: 404 }));
  }

  const comment = await Comment.findById(id);

  if (
    ![comment.user.toString(), PostExists.publisher.toString()].includes(
      req.authUser.id,
    )
  ) {
    return next(new Error("not allowed", { cause: 401 }));
  }

  if (comment.attachment.public_id) {
    await cloudinary.uploader.destroy(comment.attachment.public_id);
  }

  await comment.deleteOne();

  return res.status(200).json({
    success: true,
    messages: messages.comment.deletedSuccessfully,
  });
};
