import path from "node:path";
import fs, { ReadStream, WriteStream } from "node:fs";
import ffmpeg from "fluent-ffmpeg";
import { logger } from "../lib";
import { Config } from "../config";
import mime from "mime-types";

export class FileStorage {
  static shared: FileStorage;

  // ---------------------------------

  $storagePath: string = "";

  // ---------------------------------

  static async connect(storage?: string): Promise<FileStorage> {
    const storagePath = path.resolve(storage || "./_storage");

    let instance: FileStorage;
    if (this.shared && this.shared.$storagePath == storagePath) {
      instance = this.shared;
    } else {
      instance = new FileStorage();
      instance.$storagePath = storagePath;
    }

    logger.info("DATASOURCE: FileStorage has connected successfully", instance);

    if (this.shared === undefined) {
      this.shared = instance;
    }

    return instance;
  }

  // ========================================

  static parsefileName(filename: string): {
    name: string;
    ext: string;
    mimeType: string;
  } {
    const { name, ext } = path.parse(decodeURI(filename));
    const fileExt = ext ? ext.slice(1) : "data";
    const mimeType = mime.lookup("file." + fileExt);
    return {
      name: decodeURI(name),
      ext: fileExt,
      mimeType: mimeType ? `${mimeType}` : "application/octet-stream",
    };
  }

  pathFile(filename: string): string {
    const pathDir = this.$storagePath;
    return path.join(pathDir, `${filename}.mp4`);
  }

  // ------------

  async readFileStream(filename: string): Promise<ReadStream> {
    const filePath = this.pathFile(filename);

    try {
      await fs.promises.access(filePath);
      return fs.createReadStream(filePath);
    } catch (err) {
      const error = err as Error;
      logger.fail(`Error readFileStream by ${filePath}`);
      logger.error(error);

      throw new Error(
        `Error readFileStream by ${filePath}: ${
          (err as Error).message
        } stack: ${(err as Error).stack}`
      );
    }
  }

  // ------------

  async writeFileStream(filename: string): Promise<WriteStream> {
    await checkDirPath(this.$storagePath);

    const filePath = this.pathFile(filename);

    try {
      return fs.createWriteStream(filePath, {
        flags: "w+",
        encoding: "binary",
      });
    } catch (err) {
      const error = err as Error;

      logger.fail(`Error writeFileStream by ${filePath}`);
      logger.error(error);
      throw new Error(
        `Error create WriteStream by ${filePath}: ${
          (err as Error).message
        } stack: ${(err as Error).stack}`
      );
    }
  }
  // ------------

  async deleteFile(filename: string): Promise<void> {
    const path = this.pathFile(filename);

    try {
      await fs.promises.access(path);
      await fs.promises.rm(path, { recursive: true, force: true });
    } catch (err) {
      throw new Error(
        `Error deleteFile by ${path}: ${(err as Error).message} stack: ${
          (err as Error).stack
        }`
      );
    }
  }

  // ------------

  async movToMp4(file: string, config: Config): Promise<string> {
    const log = logger;
    log.dbg("Starting MOV to MP4 conversion...");

    const opt = config.datasource.storage;

    try {
      await fs.promises.access(file);
      const createReadStream = await this.readFileStream(file);
      const outputFilePath = path.join(opt.path, `${Date.now()}.mp4`);
      await new Promise((resolve, reject) => {
        ffmpeg(createReadStream)
          .outputFormat("mp4")
          .on("end", () => {
            log.dbg("Conversion finished successfully.");
            resolve(outputFilePath);
          })
          .on("error", (err) => {
            log.fail("Conversion error:");
            log.error(err);
            reject(err);
          })
          .save(outputFilePath);
      });

      log.dbg("File successfully converted to MP4:", outputFilePath);
      return outputFilePath;
    } catch (e) {
      const error = e as Error;
      log.fail("Error during file conversion:");
      log.error(error);
      throw new Error(`Failed to convert file: ${error.message}`);
    }
  }
}

// ===================================================

export async function checkDirPath(
  path: string,
  create: boolean = true
): Promise<boolean> {
  try {
    await fs.promises.access(path);
    return true;
  } catch (err) {
    if (!create) {
      return false;
    }

    try {
      await fs.promises.mkdir(path, { recursive: true });
      await fs.promises.access(path);
      return true;
    } catch (err) {
      throw err;
    }
  }
}
