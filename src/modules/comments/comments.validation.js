import joi from "joi";
import { generaleField } from "../../middlewares/isValid.js";

//create comment validation
export const createCommentValidation = joi
  .object({
    postId: generaleField.id.required(),
    id: generaleField.id,
    text: joi.string(),
    attachments: generaleField.attachments,
  })
  .or("text", "attachments")
  .required();

//get comments validation
export const getCommentsValidation = joi
  .object({
    postId: generaleField.id.required(),
    id: generaleField.id,
  })
  .required();

//delete comment validation
export const deleteCommentsValidation = joi
  .object({
    postId: generaleField.id.required(),
    id: generaleField.id.required(),
  })
  .required();
