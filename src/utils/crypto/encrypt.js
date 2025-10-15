import crypto from "crypto-js";

export const encrypt = (data, key = process.env.CRYPTO_KEY) => {
  return crypto.AES.encrypt(data, key).toString();
};
