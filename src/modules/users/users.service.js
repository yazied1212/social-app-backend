import { User } from "../../db/models/user.js";
import { decrypt, defaultPfp, messages, pfpId } from "../../utils/index.js";
import fs from "fs";
import cloudinary from "../../utils/multer/cloud-config.js";

//get profile
export const profile = (req, res, next) => {
  const userExists = req.authUser;
  userExists.phoneNumber = decrypt(userExists.phoneNumber);

  return res.status(200).json({
    success: true,
    data: userExists,
  });
};

//deactivate account
export const deactivate = async (req, res, next) => {
  const userExists = req.authUser;
  await User.findByIdAndUpdate(userExists._id, {
    isDeleted: true,
    deletedAt: Date.now(),
  });

  return res.status(200).json({
    success: true,
    message:
      "account deactivated successfully , it will get deleted automatically after 30 days",
  });
};

//update user
export const updateUser = async (req, res, next) => {
  const userExists = req.authUser;
  await User.findByIdAndUpdate(userExists._id, { ...req.body });

  return res.status(200).json({
    success: true,
    message: messages.user.updatedSuccessfully,
  });
};

//upload pfp
export const upPfp = async (req, res, next) => {
  if (
    fs.existsSync(req.authUser.profilePicture) &&
    req.authUser.profilePicture != defaultPfp
  ) {
    fs.unlinkSync(req.authUser.profilePicture);
  }

  const pfp = await User.findByIdAndUpdate(
    req.authUser._id,
    { profilePicture: req.file.path },
    { new: true },
  );

  return res.status(200).json({
    success: true,
    message: "profile picture uploaded successfully",
    pfp: pfp.profilePicture,
  });
};

//delete pfp
export const delPfp = async (req, res, next) => {
  if (
    fs.existsSync(req.authUser.profilePicture) &&
    req.authUser.profilePicture != defaultPfp
  ) {
    fs.unlinkSync(req.authUser.profilePicture);
  }

  await User.findByIdAndUpdate(
    req.authUser._id,
    { profilePicture: defaultPfp },
    { new: true },
  );

  return res.status(200).json({
    success: true,
    message: "profile picture deleted successfully",
  });
};

//upload cloud pfp
export const upCloudPfp = async (req, res, next) => {
  if (req.authUser.public_id != pfpId) {
    await cloudinary.uploader.destroy(req.authUser.public_id);
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `social-app/users/${req.authUser._id}/profile-picture`,
    },
  );

  const pfp = await User.findByIdAndUpdate(req.authUser._id, {
    profilePictureCloud: { secure_url, public_id },
  });

  return res.status(200).json({
    success: true,
    message: "profile picture uploaded successfully",
    pfp: pfp.profilePictureCloud,
  });
};

//upload cover pic
export const upCover = async (req, res, next) => {
  const coverPic = req.files.map((file) => file.path);
  await User.findByIdAndUpdate(req.authUser, { coverPic });

  return res.status(200).json({
    success: true,
    message: "cover picture uploaded successfully",
  });
};

//send friend req
export const sendFriendRequest = async (req, res, next) => {
  const { friendId } = req.params;

  if (friendId === req.authUser.id) {
    return next(
      new Error("cannot send friend request to yourself", { cause: 400 }),
    );
  }

  const isExists = await User.findOne({ _id: friendId, isDeleted: false });
  if (!isExists) {
    return next(new Error(messages.user.notFound, { cause: 404 }));
  }

  const isFriend = isExists.friends.map(String).includes(req.authUser.id);
  if (isFriend) {
    return next(new Error("already friends", { cause: 400 }));
  }

  const isRequested = isExists.friendRequests
    .map(String)
    .includes(req.authUser.id);
  if (isRequested) {
    return next(new Error("friend request already sent", { cause: 400 }));
  }

  isExists.friendRequests.push(req.authUser.id);
  await isExists.save();

  return res.status(200).json({
    success: true,
    message: "friend request sent successfully",
  });
};

//accept friend req
export const acceptFriendRequest = async (req, res, next) => {
  const { friendId } = req.params;

  const promise = Promise.all([
    User.updateOne(
      { _id: req.authUser._id },
      {
        $pull: { friendRequests: friendId },
        $addToSet: { friends: friendId },
      },
    ),
    User.updateOne(
      { _id: friendId },
      { $addToSet: { friends: req.authUser._id } },
    ),
  ]);

  await promise;

  return res.status(200).json({
    success: true,
    message: "friend added successfully",
  });
};
