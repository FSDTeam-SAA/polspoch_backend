import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import paymentService from "./payment.service";

const createPayment = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await paymentService.createPayment(req.body, email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment created successfully",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await paymentService.getMyPayments(email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const getAllPayments = catchAsync(async (req, res) => {
  const result = await paymentService.getAllPayments();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const getSinglePayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const result = await paymentService.getSinglePayment(paymentId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
});

const paymentController = {
  createPayment,
  getMyPayments,
  getAllPayments,
  getSinglePayment,
};

export default paymentController;
