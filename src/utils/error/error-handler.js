import path from "path";
import fs from "fs";

export const errorHandler = (error, req, res, next) => {
  if (req.file) {
    const fullPath = path.resolve(req.file.path);
    fs.unlinkSync(fullPath);
  }

  return res.status(error.cause || 500).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
};
