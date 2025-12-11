import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import analyticsService from "./analytics.service";

const getAnalytics = catchAsync(async (req, res) => {
  const result = await analyticsService.getAnalytics();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Data fetched successfully",
    data: result,
  });
});

const getChartData = catchAsync(async (req, res) => {
  const year = Number(req.params.year);
  const result = await analyticsService.getChartData(year);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Data fetched successfully",
    data: result,
  });
});

const analyticController = {
  getAnalytics,
  getChartData,
};

export default analyticController;
