import joi from "joi";
import { generaleField } from "../../middlewares/isValid.js";

export const updatedUserSchema = joi
  .object({
    userName: joi.string().min(2).max(25),
    email: joi.string().email(),
    password: joi.string(),
    cPassword: joi.string().valid(joi.ref("password")),
    phoneNumber: joi.string().pattern(/^[0-9]{10,15}$/),
    gender: joi.string().valid(...["male", "female"]),
  })
  .required();

export const sendFriendRequestSchema = joi
  .object({
    friendId: generaleField.id.required(),
  })
  .required();

export const acceptFriendRequestSchema = joi
  .object({
    friendId: generaleField.id.required(),
  })
  .required();
