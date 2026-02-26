import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import orderShippingPolicyService from "./orderShippingPolicy.service";

const createOrderShippingPolicy = catchAsync(async (req, res) => {
  const result = await orderShippingPolicyService.createOrderShippingPolicy(
    req.body,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order shipping policy created successfully",
    data: result,
  });
});

const getOrderShippingPolicy = catchAsync(async (req, res) => {
  const result = await orderShippingPolicyService.getOrderShippingPolicy();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order shipping policy retrieved successfully",
    data: result,
  });
});

const updateOrderShippingPolicy = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await orderShippingPolicyService.updateOrderShippingPolicy(
    id,
    req.body,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order shipping policy updated successfully",
    data: result,
  });
});

const deleteOrderShippingPolicy = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await orderShippingPolicyService.deleteOrderShippingPolicy(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order shipping policy deleted successfully",
    data: result,
  });
});

const orderShippingPolicyController = {
  createOrderShippingPolicy,
  getOrderShippingPolicy,
  updateOrderShippingPolicy,
  deleteOrderShippingPolicy,
};

export default orderShippingPolicyController;
