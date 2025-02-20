import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/index";

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const url = req.url;

  logger.info(
    "",
    {
      date: new Date(),
    },
    `[HTTP Request] ${req.method} ${url} from ${req.ip}`
  );

  res.on("close", () => {
    logger.info(
      "",
      { date: new Date() },
      `[HTTP Response] ${req.method} ${url} ${res.statusCode}`
    );
  });

  next(); // Переместили next() сюда
};
