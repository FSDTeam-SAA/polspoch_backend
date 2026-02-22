import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import AppError from "../../errors/AppError";
import serviceServices from "./service.services";
import Service from "./service.model";

/**
 * Create a new service (rebar, bending, cutting)
 */
export const createService = catchAsync(async (req, res) => {
  const data = req.body;
  const guestId = req.headers["x-guest-id"] as string;
  const userId = req.user?.id;

  if (!userId && !guestId) {
    throw new AppError(
      "Identification required (User or Guest ID)",
      StatusCodes.BAD_REQUEST
    );
  }

  const payload = {
    ...data,
    userId,
    guestId: userId ? undefined : guestId,
  };

  const createdService = await serviceServices.createService(payload);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Service created successfully",
    data: createdService,
  });
});

export const getMyServices = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const guestId = req.headers["x-guest-id"] as string;

  let services;
  if (userId) {
    services = await serviceServices.getServicesByUserId(userId);
  } else if (guestId) {
    services = await Service.find({ guestId }).sort({ createdAt: -1 });
  } else {
    throw new AppError("Identification required", StatusCodes.BAD_REQUEST);
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Services retrieved successfully",
    data: services,
  });
});
