import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/tokenGenerate";
import config from "../config";

const auth = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const extractedToken = req.headers.authorization;
      const token = extractedToken?.split(" ")[1];

      if (!token || token === 'null' || token === 'undefined') {
        // If no token is provided, we allow it to pass only if no specific roles are required (guest access).
        if (roles.length === 0) {
          return next();
        }
        throw new AppError("You are not authorized!", StatusCodes.UNAUTHORIZED);
      }

      const verifyUserData = verifyToken(token, config.JWT_SECRET as string) as any;

      req.user = verifyUserData;

      if (roles.length && !roles.includes(verifyUserData.role)) {
        throw new AppError("You are not authorized!", StatusCodes.UNAUTHORIZED);
      }

      next();
    } catch (error) {
      console.log(error);
      throw new AppError("You are not authorized", StatusCodes.UNAUTHORIZED);
    }
  };
};

export default auth;
