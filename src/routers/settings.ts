import Express from "express";
import cors from "cors";
import { errorHandler, loggerMiddleware } from "../middlewares";

export const buildRouter = (handlers: Express.Router[]) => {
  const router = Express.Router();

  router.use([cors(), Express.json()]);
  router.use(loggerMiddleware);
  router.use(handlers);
  router.use(errorHandler);

  return router;
};
