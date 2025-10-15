import joi from "joi";
import { generaleField } from "../../middlewares/isValid.js";
import { roles } from "../../utils/index.js";

//update role validation
export const updateRoleValidation = joi
  .object({
    userId: generaleField.id.required(),
    role: joi
      .string()
      .valid(...Object.values(roles))
      .required(),
  })
  .required();
