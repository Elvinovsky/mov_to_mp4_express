import Express from "express";
import { defaultConfig } from "../config";

const httpConfig = defaultConfig.http;

const buildStart = (app: Express.Express) => {
  return (router: Express.Router) => {
    app.use(router);

    const server = app.listen(httpConfig.port, httpConfig.host);

    const stop = () => {
      server.close();
    };

    return stop;
  };
};

export const buildServer = () => {
  const app = Express();

  return {
    start: buildStart(app),
  };
};
