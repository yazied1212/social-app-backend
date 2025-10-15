import { Post } from "../../db/models/post.js";
import { messages } from "../../utils/index.js";
import cloudinary from "../../utils/multer/cloud-config.js";

//create post
export const createPost = async (req, res, next) => {
  let attachments = [];
  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `social-app/users/${req.authUser._id}/posts` },
    );
    attachments.push({ secure_url, public_id });
  }

  const createdPost = await Post.create({
    content: req.body.content,
    attachments,
    publisher: req.authUser._id,
  });

  return res.status(201).json({
    success: true,
    message: messages.post.createdSuccessfully,
    createdPost,
  });
};

//like-unlike
export const likeUnlike = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new Error(messages.post.notFound, { cause: 404 }));
  }

  const userIndex = post.likes.indexOf(req.authUser._id);
  if (userIndex == -1) {
    post.likes.push(req.authUser._id);
  } else {
    post.likes.splice(userIndex, 1);
  }

  const updatedPost = await post.save();

  return res.status(200).json({
    success: true,
    data: updatedPost,
  });
};

//get posts
export const getPosts = async (req, res, next) => {
  let { page, size } = req.query;
  if (!page) {
    page = 1;
  }
  if (!size) {
    size = 10;
  }
  const skip = (page - 1) * size;

  const posts = await Post.find({ isDeleted: false })
    .populate([
      { path: "publisher", select: "userName profilePictureCloud.secure_url" },
      { path: "likes", select: "userName profilePictureCloud.secure_url" },
      {
        path: "comments",
        select: "user text",
        match: { parentComment: { $exists: false } },
      },
    ])
    .limit(size)
    .skip(skip);

  if (!posts) {
    return next(new Error(messages.post.notFound, { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: posts,
  });
};

//get Specific
export const getSpecificPost = async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findOne({ _id: id, isDeleted: false }).populate([
    { path: "publisher", select: "userName profilePictureCloud.secure_url" },
    { path: "likes", select: "userName profilePictureCloud.secure_url" },
    {
      path: "comments",
      select: "user text",
      match: { parentComment: { $exists: false } },
    },
  ]);

  if (!post) {
    return next(new Error(messages.post.notFound, { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: post,
  });
};

//delete post
export const deletePost = async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findById(id).populate([
    {
      path: "comments",
      select: "attachment",
      match: { parentComment: { $exists: false } },
    },
  ]);
  if (!post) {
    return next(new Error(messages.post.notFound, { cause: 404 }));
  }

  if (post.publisher.toString() != req.authUser.id) {
    return next(new Error("not allowed", { cause: 401 }));
  }

  for (const file of post.attachments) {
    await cloudinary.uploader.destroy(file.public_id);
  }

  for (const comment of post.comments) {
    if (comment.attachment.public_id) {
      await cloudinary.uploader.destroy(comment.attachment.public_id);
    }

    await comment.deleteOne();
  }

  await post.deleteOne();

  return res.status(200).json({
    success: true,
    message: messages.post.deletedSuccessfully,
  });
};

//archive post
export const archivePost = async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findOne({ _id: id, isDeleted: false });
  if (!post) {
    return next(new Error(messages.post.notFound, { cause: 404 }));
  }

  if (post.publisher.toString() != req.authUser.id) {
    return next(new Error("not allowed", { cause: 401 }));
  }

  post.isDeleted = true;
  await post.save();

  return res.status(200).json({
    success: true,
    message: "post archived successfully",
  });
};

//restore post
export const restorePost = async (req, res, next) => {
  const { id } = req.params;

  const post = await Post.findOne({ _id: id, isDeleted: true });
  if (!post) {
    return next(new Error(messages.post.notFound, { cause: 404 }));
  }

  if (post.publisher.toString() != req.authUser.id) {
    return next(new Error("not allowed", { cause: 401 }));
  }

  post.isDeleted = false;
  await post.save();

  return res.status(200).json({
    success: true,
    message: "post restored successfully",
  });
};

//undo post
export const undoPost = async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    return next(new Error(messages.post.notFound, { cause: 404 }));
  }

  if (post.publisher.toString() != req.authUser.id) {
    return next(new Error("now allowed", { cause: 401 }));
  }

  if (Date.now() > post.createdAt.getTime() + 120000) {
    return next(
      new Error("now allowed to undo after 2 minutes", { cause: 400 }),
    );
  }

  await post.deleteOne();

  return res.status(200).json({
    success: true,
    message: messages.post.deletedSuccessfully,
  });
};
