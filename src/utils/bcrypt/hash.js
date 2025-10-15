import bcrypt from "bcrypt";

export const hashSync = (data, salt = 12) => {
  return bcrypt.hashSync(data, salt);
};
