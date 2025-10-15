import { Router } from "express";
import { isAuthenticate } from "../../middlewares/auth.js";
import {
  asyncHandler,
  cloudUpload,
  fileValidation,
  roles,
} from "../../utils/index.js";
import { isValid } from "../../middlewares/isValid.js";
import {
  createCommentValidation,
  deleteCommentsValidation,
  getCommentsValidation,
} from "./comments.validation.js";
import {
  CreateComment,
  deleteComment,
  getComments,
} from "./comments.service.js";
import { isAuthorized } from "../../middlewares/isAuthorized.js";

const router = Router({ mergeParams: true });
router.use(isAuthenticate, isAuthorized(roles.user));
router.post(
  "/:id?",
  cloudUpload(fileValidation.images).single("attachments"),
  isValid(createCommentValidation),
  asyncHandler(CreateComment),
);
router.get("/:id?", isValid(getCommentsValidation), asyncHandler(getComments));
router.delete(
  "/:id",
  isValid(deleteCommentsValidation),
  asyncHandler(deleteComment),
);

export default router;
