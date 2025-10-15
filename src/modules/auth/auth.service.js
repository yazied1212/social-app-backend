import { OAuth2Client } from "google-auth-library";
import { OTP } from "../../db/models/otp.js";
import { User } from "../../db/models/user.js";
import {
  compareSync,
  encrypt,
  generateOtp,
  hashSync,
  messages,
  sendEmail,
  signToken,
  verifyToken,
} from "../../utils/index.js";
import { generateAndSendOtp } from "../../middlewares/otp.js";

//send otp
export const sendOTP = async (req, res, next) => {
  const { email } = req.body;
  generateAndSendOtp(email);

  return res.status(201).json({
    success: true,
    message: messages.otp.createdSuccessfully,
  });
};

//register
export const register = async (req, res, next) => {
  //create user
  const { email, userName, password, gender, phoneNumber, otp } = req.body;

  const otpMatch = await OTP.findOne({ email: email, otp: otp });
  if (!otpMatch) {
    return next(new Error("invalid code", { cause: 400 }));
  }

  const createdUser = await User.create({
    userName,
    email,
    password,
    phoneNumber: encrypt(phoneNumber),
    gender,
  });

  /*send email
    const token=signToken({payload:{id:createdUser._id},options:{expiresIn:"1m"}})
    const link=`http://localhost:3000/auth/activate-account/${token}`
    const isSent=sendEmail({
        to:email,
        subject:"activate your account",
        html:`<p>to activate your account please click<a href=${link}>here</a></p>`
    })
    if(!isSent){
        return next(new Error("fail to send email please try again"))
    }*/

  //res
  return res.status(201).json({
    success: true,
    message: messages.user.createdSuccessfully,
    createdUser,
  });
};

//login
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const emailExists = await User.findOne({ email: email });
  if (!emailExists) {
    return next(new Error(messages.user.invalidEorP, { cause: 401 }));
  }

  const match = compareSync(password, emailExists.password);
  if (!match) {
    return next(new Error(messages.user.invalidEorP, { cause: 401 }));
  }

  /* if(emailExists.isConfirmed===false){
        return next(new Error("please activate your account",{cause:401}))
    }*/

  if (emailExists.isDeleted === true) {
    emailExists.isDeleted = false;
    await emailExists.save();
  }

  if (emailExists.twoStepVerification === true) {
    generateAndSendOtp(emailExists.email);
    return res.status(201).json({
      success: true,
      message: messages.otp.createdSuccessfully,
    });
  }

  const accessToken = signToken({
    payload: { id: emailExists._id },
    options: { expiresIn: "1h" },
  });
  const refreshToken = signToken({
    payload: { id: emailExists._id },
    options: { expiresIn: "1y" },
  });

  return res.status(200).json({
    success: true,
    message: messages.user.login,
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};

//login with google
const verifyGoogleToken = async (idToken) => {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
};

export const googleLogin = async (req, res, next) => {
  const { idToken } = req.body;
  const { email, picture, name } = await verifyGoogleToken(idToken);
  let emailExists = await User.findOne({ email });
  if (!emailExists) {
    emailExists = await User.create({
      email,
      profilePicture: picture,
      userName: name,
      provider: "google",
    });
  }

  const accessToken = signToken({
    payload: { id: emailExists._id },
    options: { expiresIn: "1h" },
  });
  const refreshToken = signToken({
    payload: { id: emailExists._id },
    options: { expiresIn: "1y" },
  });

  if (emailExists.isDeleted === true) {
    emailExists.isDeleted = false;
    await emailExists.save();
  }

  return res.status(200).json({
    success: true,
    message: messages.user.login,
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};

//verify login otp
export const twoStepLogin = async (req, res, next) => {
  const { otp, email } = req.body;
  const otpMatch = await OTP.findOne({ email: email, otp: otp });
  if (!otpMatch) {
    return next(new Error("invalid code", { cause: 400 }));
  }

  const emailExists = await User.findOne({ email: email });
  const accessToken = signToken({
    payload: { id: emailExists._id },
    options: { expiresIn: "1h" },
  });
  const refreshToken = signToken({
    payload: { id: emailExists._id },
    options: { expiresIn: "1y" },
  });

  return res.status(200).json({
    success: true,
    message: messages.user.login,
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};

//activate
export const activateAccount = async (req, res, next) => {
  const token = req.params.token;
  const { id, error } = verifyToken(token);
  if (error) {
    return next(new Error(error.message));
  }

  const user = await User.findByIdAndUpdate(id, { isConfirmed: true });
  if (!user) {
    return next(new Error(messages.user.notFound, { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    message: "account activated successfully",
  });
};

//refreshToken
export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  const { error, id, iat } = verifyToken(refreshToken);

  if (error) {
    return next(new Error(error.message));
  }

  const user = await User.findById(id);
  if (user.lastPassUpdate && user.lastPassUpdate.getTime() > iat * 1000) {
    return next(new Error("please log in again"));
  }

  const accessToken = signToken({
    payload: { id: id },
    options: { expiresIn: "1h" },
  });

  return res.status(201).json({
    success: true,
    accessToken: accessToken,
  });
};

//verify otp and forget password
export const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  const otpMatch = await OTP.findOne({ email: email, otp: otp });
  if (!otpMatch) {
    return next(new Error("invalid code", { cause: 400 }));
  }

  return res.status(200).json({
    success: true,
    message: "otp verified successfully",
  });
};

export const forgetPassword = async (req, res, next) => {
  const { newPassword, email } = req.body;

  const user = await User.findOneAndUpdate(
    { email: email },
    { password: newPassword },
  );
  if (!user) {
    return next(new Error(messages.user.notFound, { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    message: "password updated successfully",
  });
};

//2 step verification
export const twoStepVerificationSendOtp = async (req, res, next) => {
  generateAndSendOtp(req.authUser.email);
  return res.status(201).json({
    success: true,
    message: messages.otp.createdSuccessfully,
  });
};

export const verify2Step = async (req, res, next) => {
  const { otp } = req.body;
  const otpMatch = await OTP.findOne({ email: req.authUser.email, otp: otp });
  if (!otpMatch) {
    return next(new Error("invalid code", { cause: 400 }));
  }

  const user = req.authUser;

  user.twoStepVerification = true;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "2 step verification enabled successfully",
  });
};
