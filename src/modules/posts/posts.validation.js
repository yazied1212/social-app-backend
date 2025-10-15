import joi from "joi";
import { generaleField } from "../../middlewares/isValid.js";

//create post
export const createPostValid = joi
  .object({
    content: joi.string(),
    attachments: joi.array().items(generaleField.attachments),
  })
  .or("content", "attachments")
  .required();

//like-unlike
export const likeUnlikeValid = joi
  .object({
    id: generaleField.id,
  })
  .required();

//get posts
export const getPostsValid = joi.object({
  page: joi.number().min(1),
  size: joi.number().min(1),
});

//get specific post
export const getSpecificPostValid = joi
  .object({
    id: generaleField.id.required(),
  })
  .required();

//delete post
export const deletePostValidation = joi
  .object({
    id: generaleField.id.required(),
  })
  .required();

//archive post
export const archivePostValidation = joi
  .object({
    id: generaleField.id.required(),
  })
  .required();

//restore post
export const restorePostValidation = joi
  .object({
    id: generaleField.id.required(),
  })
  .required();

//undo post
export const undoPostValidation = joi
  .object({
    id: generaleField.id.required(),
  })
  .required();
