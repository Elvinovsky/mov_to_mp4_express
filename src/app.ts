import cluster from "cluster";
import * as server from "./http";
import { Config, defaultConfig } from "./config";
import { logger } from "./lib";
import { buildRouter } from "./routers/settings";

process.on("uncaughtException", function (err) {
  logger.error(err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
  console.error("Promise:", promise);
});

const config: Config = defaultConfig;

logger.info(
  "app",
  {},
  `Server started [Port: ${config.http.port}]` +
    "\n" +
    `\tAPI URL: http://${config.http.host}:${config.http.port}/`
);

function entry() {
  const router = buildRouter();

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
