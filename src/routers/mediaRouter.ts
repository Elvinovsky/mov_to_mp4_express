import { Request, Response, Router } from "express";
import { FileStorage } from "../fileManager";
import { logger } from "../lib";
import { defaultConfig } from "../config";
import multer from "multer";
import fs from "fs";

export const mediaRouter = Router();

const MAX_FILE_SIZE = defaultConfig.datasource.storage.maxFileUploadSize;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

// ===================== UPLOAD VIDEO =====================

mediaRouter.post(
  "/upload",
  upload.single("video"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No video file uploaded" });
      return;
    }

    const originalFilename = req.file.originalname;
    const { name, ext } = FileStorage.parsefileName(originalFilename);

    if (ext !== "mov") {
      res.status(400).json({ error: "Only .mov files are allowed" });
      return;
    }

    try {
      logger.dbg("Uploading file:", originalFilename);

      const tempFilePath = `./uploads/${name}.mov`;
      fs.writeFileSync(tempFilePath, req.file.buffer);

      // Запускаем конвертацию в .mp4
      const storage = await FileStorage.connect();
      const staticLink = await storage.movToMp4(tempFilePath, defaultConfig);

      logger.info(`File converted successfully: ${staticLink}`);

      res.status(200).json({
        message: "File uploaded and converted",
        downloadLink: staticLink,
      });
    } catch (err) {
      const e = err as Error;
      logger.error(e);
      res
        .status(500)
        .json({ error: "Upload failed", details: (err as Error).message });
    }
  }
);

// ===================== DOWNLOAD VIDEO =====================

mediaRouter.get("/download/:filename", async (req: Request, res: Response) => {
  const filename = req.params.filename;

  if (!filename.endsWith(".mp4")) {
    res.status(400).json({ error: "Only .mp4 files can be downloaded" });
    return;
  }

  try {
    const storage = await FileStorage.connect();
    const filePath = storage.pathFile(filename.replace(".mp4", "")); // Убираем расширение перед поиском

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    logger.info(`Streaming file: ${filePath}`);
    res.setHeader("Content-Type", "video/mp4");
    
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (err) {
    const e = err as Error;
    logger.fail("Download failed:");
    logger.error(e);
    res
      .status(500)
      .json({ error: "Download failed", details: (err as Error).message });
  }
});
