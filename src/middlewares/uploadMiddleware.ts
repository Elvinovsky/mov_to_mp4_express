import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { defaultConfig } from "../config";
import path from "path";

const storage = multer.diskStorage({
  destination: defaultConfig.datasource.storage.path,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".mov") {
    return cb(new Error("Only .mov format is allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: defaultConfig.datasource.storage.maxFileUploadSize },
});

export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single("video")(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
};
