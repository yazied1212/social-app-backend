import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

export const fileValidation = {
  images: ["image/png", "image/jpeg", "image/jpg"],
  video: ["video/mp4", "video/mpeg"],
};

export const fileUpload = (allowedTypes, folder) => {
  try {
    const storage = diskStorage({
      destination: (req, file, cb) => {
        const fullPath = path.resolve(`${folder}/${req.authUser._id}`);
        fs.mkdirSync(fullPath, { recursive: true });
        cb(null, fullPath);
      },

      filename: (req, file, cb) => {
        cb(null, nanoid() + file.originalname);
      },
    });

    const fileFilter = (req, file, cb) => {
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("this file type is not allowed"), false);
      }
      return cb(null, true);
    };

    return multer({ storage, fileFilter });
  } catch (error) {
    console.log(error.message);
  }
};
