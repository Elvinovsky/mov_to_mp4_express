import { Request, Response } from "express";
import { logger } from "../lib";
import fs from "fs";
import { defaultConfig } from "../config";
import path from "path";
import { convertMovToMp4, getFilePath } from "../lib";

// ===================== UPLOAD VIDEO =====================

export const uploadVideo = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No video file uploaded" });
    return;
  }

  try {
    const originalName = req.file.originalname;

    logger.dbg("Uploading file:", originalName);

    const outputPath = await convertMovToMp4(req.file.path);
    fs.unlink(req.file.path, () => {});

    logger.info(`File converted successfully: ${outputPath}`);

    const downloadLink = `${defaultConfig.http.baseUrl}download/${path.basename(
      outputPath
    )}`;

    res.status(200).json({ downloadLink });
  } catch (err) {
    const e = err as Error;
    logger.error(e);
    res
      .status(500)
      .json({ error: "Upload failed", details: (err as Error).message });
  }
};

// ===================== DOWNLOAD VIDEO =====================

export const downloadVideo = async (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = getFilePath(filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.setHeader("Content-Type", "video/mp4");
  fs.createReadStream(filePath).pipe(res);
};
