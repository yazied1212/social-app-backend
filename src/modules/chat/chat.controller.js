import { Router } from "express";
import { isAuthenticate } from "../../middlewares/auth.js";
import { isAuthorized } from "../../middlewares/isAuthorized.js";
import { asyncHandler, roles } from "../../utils/index.js";
import { isValid } from "../../middlewares/isValid.js";
import { getAllChatSchema } from "./chat.validation.js";
import { getAllChat } from "./chat.service.js";

const router = Router();
router.use(isAuthenticate, isAuthorized(roles.user));

router.get("/:friendId", isValid(getAllChatSchema), asyncHandler(getAllChat));

export default router;
