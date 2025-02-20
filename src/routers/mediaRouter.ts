import { uploadMiddleware } from "../middlewares";
import { downloadVideo, uploadVideo } from "../controllers/media";
import { Router } from "express";

export const mediaRouter = Router();

mediaRouter.post("/upload", uploadMiddleware, uploadVideo);
mediaRouter.get("/download/:filename", downloadVideo);
