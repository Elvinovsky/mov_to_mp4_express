import * as dotenv from "dotenv";

dotenv.config();

export interface Config {
  stage: string;

  http: {
    port: number;
    host: string;
    baseUrl: string;
  };

  datasource: {
    storage: {
      path: string;
      maxFileUploadSize: number;
    };
  };
}

export const defaultConfig: Config = {
  stage: process.env.STAGE || "dev",

  http: {
    port: Number.parseInt(process.env.SERVER_PORT || "8080"),
    host: process.env.SERVER_HOST || "localhost",
    baseUrl: `http://${process.env.SERVER_HOST || "localhost"}:${Number.parseInt(process.env.SERVER_PORT || "8080")}/`,
  },

  datasource: {
    storage: {
      path: process.env.DATASOURCE_STORAGE_DIR || "./_storage",
      maxFileUploadSize: 1024 * 1024 * 1024,
    },
  },
};
