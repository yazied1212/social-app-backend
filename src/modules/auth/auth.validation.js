import joi from "joi";

//login with google
export const google = joi
  .object({
    idToken: joi.string().required(),
  })
  .required();

//otp
export const otpSchema = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

//register
export const registerSchema = joi
  .object({
    userName: joi.string().min(2).max(25).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    cPassword: joi.string().valid(joi.ref("password")).required(),
    phoneNumber: joi
      .string()
      .pattern(/^[0-9]{10,15}$/)
      .required(),
    gender: joi
      .string()
      .valid(...["male", "female"])
      .required(),
    otp: joi.string().length(6).required(),
  })
  .required();

//login
export const loginSchema = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();

//refresh token
export const refreshTokenSchema = joi
  .object({
    refreshToken: joi.string().required(),
  })
  .required();

//verify otp
export const verifyOtpSchema = joi
  .object({
    email: joi.string().email().required(),
    otp: joi.string().length(6).required(),
  })
  .required();

//forgetPassword
export const forgetPasswordSchema = joi
  .object({
    email: joi.string().email().required(),
    newPassword: joi.string().required(),
    cNewPassword: joi.string().valid(joi.ref("newPassword")).required(),
  })
  .required();

//enable 2 step verification
export const enableTwoStepVerificationSchema = joi
  .object({
    otp: joi.string().length(6).required(),
  })
  .required();

//2 step login
export const twoStepLoginSchema = joi
  .object({
    email: joi.string().email().required(),
    otp: joi.string().length(6).required(),
  })
  .required();
