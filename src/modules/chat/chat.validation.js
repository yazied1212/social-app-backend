import joi from "joi";
import { generaleField } from "../../middlewares/isValid.js";

export const getAllChatSchema = joi
  .object({
    friendId: generaleField.id.required(),
  })
  .required();
