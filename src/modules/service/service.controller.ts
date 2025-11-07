import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import serviceServices from "./service.services";

const createNewService = catchAsync(async (req, res) => {
  const files: any = req.files;
  const result = await serviceServices.createNewService(req.body, files);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Service added successfully",
    data: result,
  });
});

const getAllServices = catchAsync(async (req, res) => {
  const result = await serviceServices.getAllServices();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Services get successfully",
    data: result,
  });
});

const getSingleService = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const result = await serviceServices.getSingleService(serviceId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Service get successfully",
    data: result,
  });
});

const updateService = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const files: any = req.files;
  const result = await serviceServices.updateService(
    req.body,
    serviceId,
    files
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Service updated successfully",
    data: result,
  });
});

const serviceController = {
  createNewService,
  getAllServices,
  getSingleService,
  updateService,
};

export default serviceController;
