import { Router } from "express";
import { isAuthenticate } from "../../middlewares/auth.js";
import { isAuthorized } from "../../middlewares/isAuthorized.js";
import { isValid } from "../../middlewares/isValid.js";
import { asyncHandler, roles } from "../../utils/index.js";
import { getData, updateRole } from "./admin.service.js";
import { updateRoleValidation } from "./admin.validation.js";

const router = Router();
router.use(
  isAuthenticate,
  isAuthorized(roles.admin, roles.superAdmin, roles.owner),
);
router.get("/data", asyncHandler(getData));
router.patch("/role", isValid(updateRoleValidation), asyncHandler(updateRole));

export default router;
