import { Router } from "express";
import {
  asyncHandler,
  cloudUpload,
  fileUpload,
  fileValidation,
  roles,
} from "../../utils/index.js";
import { isAuthenticate } from "../../middlewares/auth.js";
import {
  acceptFriendRequest,
  deactivate,
  delPfp,
  profile,
  sendFriendRequest,
  upCloudPfp,
  upCover,
  updateUser,
  upPfp,
} from "./users.service.js";
import { isValid } from "../../middlewares/isValid.js";
import {
  acceptFriendRequestSchema,
  sendFriendRequestSchema,
  updatedUserSchema,
} from "./users.validation.js";
import { isAuthorized } from "../../middlewares/isAuthorized.js";

const router = Router();
router.use(isAuthenticate, isAuthorized(roles.user));

router.get("/profile", asyncHandler(profile));
router.delete("/deactivate", asyncHandler(deactivate));
router.put(
  "/update-user",
  isValid(updatedUserSchema),
  asyncHandler(updateUser),
);
router.post(
  "/profile-picture",
  fileUpload(fileValidation.images, "uploads/users").single("pfp"),
  asyncHandler(upPfp),
);
router.post(
  "/cover-picture",
  fileUpload(fileValidation.images, "uploads/users").array("cover"),
  asyncHandler(upCover),
);
router.delete("/profile-picture", asyncHandler(delPfp));
router.post(
  "/cloud-profile-picture",
  cloudUpload(fileValidation.images).single("cpfp"),
  asyncHandler(upCloudPfp),
);
router.post(
  "/send-friend-request/:friendId",
  isValid(sendFriendRequestSchema),
  asyncHandler(sendFriendRequest),
);
router.put(
  "/accept-friend-request/:friendId",
  isValid(acceptFriendRequestSchema),
  asyncHandler(acceptFriendRequest),
);

export default router;
