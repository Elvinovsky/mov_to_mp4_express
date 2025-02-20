import { PoolConfig } from "pg";
import * as dotenv from "dotenv";

dotenv.config();
export interface Config {
  stage: string;

  http: {
    port: number;
    host: string;
  };

  datasource: {
    db: PoolConfig;
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
  },

  datasource: {
    db: {
      host: process.env.POSTGRES_HOST || "localhost",
      port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
      database: process.env.POSTGRES_DB || "db",
      user: process.env.POSTGRES_USER || "user",
      password: process.env.POSTGRES_PASSWORD || "pass",
      max: Number.parseInt(process.env.POSTGRES_DB_MAX_CONN || "100"),
    },

    storage: {
      path: process.env.DATASOURCE_STORAGE_DIR || "./_storage",
      maxFileUploadSize: 1024 * 1024 * 1024,
    },
  },
};
