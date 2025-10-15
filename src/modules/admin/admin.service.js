import { User } from "../../db/models/user.js";
import { Post } from "../../db/models/post.js";
import { messages, roles } from "../../utils/index.js";

//get data
export const getData = async (req, res, next) => {
  const users = await User.find();
  const posts = await Post.find();

  if (!users && !posts) {
    return next(new Error("no result found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: [{ users: [users], posts: [posts] }],
  });
};

//update role
export const updateRole = async (req, res, next) => {
  const { userId, role } = req.body;

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return next(new Error(messages.user.notFound, { cause: 404 }));
  }

  const rolesHierarchy = Object.values(roles);
  const targetUserIndex = rolesHierarchy.indexOf(targetUser.role);
  const authUserIndex = rolesHierarchy.indexOf(req.authUser.role);
  const roleIndex = rolesHierarchy.indexOf(role);

  if (authUserIndex < targetUserIndex || authUserIndex < roleIndex) {
    return next(new Error("not allowed", { cause: 401 }));
  }

  targetUser.role = role;
  targetUser.save();

  return res.status(200).json({
    success: true,
    message: "role updated successfully",
  });
};
