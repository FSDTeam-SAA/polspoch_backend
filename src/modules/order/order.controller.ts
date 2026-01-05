import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import orderService from "./order.service";
import AppError from "../../errors/AppError";
import mongoose from "mongoose";
import { Order } from "./order.model";

const createOrder = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await orderService.createNewOrder(req.body, email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

const getMyOrders = catchAsync(async (req, res) => {
  const { email } = req.user;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await orderService.getMyOrders(email, page, limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Orders fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllOrders = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { search, status, paymentStatus, sortBy } = req.query;

  const result = await orderService.getAllOrders(
    page,
    limit,
    search as string,
    status as string,
    paymentStatus as string,
    sortBy as "paid" | "unpaid"
  );

  sendResponse(res, result);
});


const updateOrderStatus = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  await orderService.updateOrderStatus(orderId, status);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order status updated successfully",
  });
});

 const   deleteOrders = catchAsync(async (req,res) => {
    
      const { orderIds } = req.body

      if (!orderIds) {
        throw new AppError('Order IDs are required', StatusCodes.BAD_REQUEST)
      }

      const idsArray = Array.isArray(orderIds)
        ? orderIds
        : orderIds.split(',')

      const objectIds = idsArray.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      )

      const result = await Order.deleteMany({
        _id: { $in: objectIds },
      })

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Orders deleted successfully',
        data: result,
      })
    } 
  )



const orderController = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrders
};

export default orderController;
