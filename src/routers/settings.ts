import Express from "express";
import cors from "cors";
import { errorHandler, loggerMiddleware } from "../middlewares";
import { mediaRouter } from "./mediaRouter";

export const buildRouter = () => {
  const router = Express.Router();

  router.use(cors());
  router.use(Express.json());
  router.use(loggerMiddleware);
  router.use(mediaRouter);
  router.use(errorHandler);

  return router;
};
