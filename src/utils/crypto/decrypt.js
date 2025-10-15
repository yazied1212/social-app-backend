import crypto from "crypto-js";

export const decrypt = (data, key = process.env.CRYPTO_KEY) => {
  return crypto.AES.decrypt(data, key).toString(crypto.enc.Utf8);
};
