import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import serviceServices from "./service.services";

/**
 * Create a new service (rebar, bending, cutting)
 */
export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    const payload = {
      ...data,
      userId: req.user.id,
    };
    const createdService = await serviceServices.createService(payload);
    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: createdService,
    });
  } catch (error) {
    next(error); // Pass errors to Express error handler
  }
};

export const getMyServices = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const services = await serviceServices.getServicesByUserId(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User services retrieved successfully",
    data: services,
  });
});
