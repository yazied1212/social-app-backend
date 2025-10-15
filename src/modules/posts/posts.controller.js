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
  archivePostValidation,
  createPostValid,
  deletePostValidation,
  getPostsValid,
  getSpecificPostValid,
  likeUnlikeValid,
  restorePostValidation,
  undoPostValidation,
} from "./posts.validation.js";
import {
  archivePost,
  createPost,
  deletePost,
  getPosts,
  getSpecificPost,
  likeUnlike,
  restorePost,
  undoPost,
} from "./posts.service.js";
import commentsRouter from "../comments/comments.controller.js";
import { isAuthorized } from "../../middlewares/isAuthorized.js";

const router = Router();

router.use("/:postId/comment", commentsRouter);
router.use(isAuthenticate, isAuthorized(roles.user));

router.post(
  "/",
  cloudUpload(...fileValidation.images, ...fileValidation.video).array(
    "attachments",
  ),
  isValid(createPostValid),
  asyncHandler(createPost),
);

router.patch(
  "/like-unlike/:id",
  isValid(likeUnlikeValid),
  asyncHandler(likeUnlike),
);
router.get("/", isValid(getPostsValid), asyncHandler(getPosts));
router.get(
  "/:id",
  isValid(getSpecificPostValid),
  asyncHandler(getSpecificPost),
);
router.delete("/:id", isValid(deletePostValidation), asyncHandler(deletePost));
router.patch(
  "/archive/:id",
  isValid(archivePostValidation),
  asyncHandler(archivePost),
);
router.patch(
  "/restore/:id",
  isValid(restorePostValidation),
  asyncHandler(restorePost),
);
router.delete("/undo/:id", isValid(undoPostValidation), asyncHandler(undoPost));

export default router;
