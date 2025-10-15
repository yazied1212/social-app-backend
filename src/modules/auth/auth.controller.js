import { Router } from "express";
import { isValid } from "../../middlewares/isValid.js";
import { asyncHandler, roles } from "../../utils/index.js";
import {
  activateAccount,
  forgetPassword,
  googleLogin,
  login,
  refreshToken,
  register,
  sendOTP,
  twoStepLogin,
  twoStepVerificationSendOtp,
  verify2Step,
  verifyOtp,
} from "./auth.service.js";
import {
  enableTwoStepVerificationSchema,
  forgetPasswordSchema,
  google,
  loginSchema,
  otpSchema,
  refreshTokenSchema,
  registerSchema,
  twoStepLoginSchema,
  verifyOtpSchema,
} from "./auth.validation.js";
import { isAuthenticate } from "../../middlewares/auth.js";
import { isAuthorized } from "../../middlewares/isAuthorized.js";

const router = Router();
router.post("/google-login", isValid(google), asyncHandler(googleLogin));
router.post("/send-otp", isValid(otpSchema), asyncHandler(sendOTP));
router.post("/register", isValid(registerSchema), asyncHandler(register));
router.post("/login", isValid(loginSchema), asyncHandler(login));
router.get("/activate-account/:token", asyncHandler(activateAccount));
router.post(
  "/refresh-token",
  isValid(refreshTokenSchema),
  asyncHandler(refreshToken),
);
router.post(
  "/forget-password-verify-otp",
  isValid(verifyOtpSchema),
  asyncHandler(verifyOtp),
);
router.post(
  "/forget-password",
  isValid(forgetPasswordSchema),
  asyncHandler(forgetPassword),
);
router.get(
  "/send-otp-2-step-verification",
  isAuthenticate,
  isAuthorized(roles.user),
  asyncHandler(twoStepVerificationSendOtp),
);
router.post(
  "/enable-2-step-verification",
  isAuthenticate,
  isAuthorized(roles.user),
  isValid(enableTwoStepVerificationSchema),
  asyncHandler(verify2Step),
);
router.post(
  "/2-step-login",
  isValid(twoStepLoginSchema),
  asyncHandler(twoStepLogin),
);
export default router;
