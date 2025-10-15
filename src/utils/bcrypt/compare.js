import bcrypt from "bcrypt";

export const compareSync = (data, hashedData) => {
  return bcrypt.compareSync(data, hashedData);
};
