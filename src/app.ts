import cluster from "cluster";
import fs from "node:fs";
import * as server from "./http";
import { Config, defaultConfig } from "./config";
import { logger } from "./lib";
import { buildRouter } from "./routers/settings";
import { mediaRouter } from "./routers/mediaRouter";

const config: Config = defaultConfig;

process.on("uncaughtException", function (err) {
  logger.error(err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
  console.error("Promise:", promise);
});

logger.info(
  "app",
  `Server started [Port: ${config.http.port}]` +
    "\n" +
    `\tAPI URL: ${config.http.baseUrl}`
);

function entry() {
  if (!fs.existsSync(defaultConfig.datasource.storage.path)) {
    fs.mkdirSync(defaultConfig.datasource.storage.path, { recursive: true });
  }

  const router = buildRouter([mediaRouter]);

  const srv = server.buildServer();
  const stopServerFn = srv.start(router);

  const sigListener = () => {
    process.exit(0);
  };
  const stopListener = () => {
    if (cluster.isPrimary) {
      logger.info("Server stopped.");
    }
    stopServerFn();
    process.exit(0);
  };

  process.on("SIGINT", sigListener);
  process.on("SIGQUIT", sigListener);
  process.on("SIGTERM", sigListener);
  process.on("exit", stopListener);
}

entry();
