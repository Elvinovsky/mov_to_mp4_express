import fs from "node:fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { defaultConfig } from "../../config";
import { logger } from "../logger";

export const convertMovToMp4 = async (inputPath: string): Promise<string> => {
  logger.dbg("Starting MOV to MP4 conversion...");

  try {
    await fs.promises.access(inputPath);

    const outputPath = inputPath.replace(".mov", ".mp4");

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputFormat("mp4")
        .on("end", () => resolve(outputPath))
        .on("error", (err) =>
          reject(new Error(`Conversion failed: ${err.message}`))
        )
        .run();
    });

    logger.dbg("File successfully converted to MP4:", outputPath);
    return outputPath;
  } catch (e) {
    const error = e as Error;
    logger.fail("Error during file conversion:");
    logger.error(error);
    throw new Error(`Failed to convert file: ${error.message}`);
  }
};

export const getFilePath = (filename: string): string => {
  return path.join(defaultConfig.datasource.storage.path, filename);
};
