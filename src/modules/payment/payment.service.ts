import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Order } from "../order/order.model";
import { User } from "../user/user.model";
import Payment from "./payment.model";

const createPayment = async (payload: { orderId: string }, email: string) => {
  const { orderId } = payload;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  const order = await Order.findOne({ _id: orderId, userId: user._id });
  if (!order) {
    throw new AppError("Order not found", StatusCodes.NOT_FOUND);
  }
};

const getMyPayments = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  const result = await Payment.find({ userId: user._id });
  return result;
};

const getAllPayments = async () => {
  const result = await Payment.find({ status: "success" });
  return result;
};

const paymentService = {
  createPayment,
  getMyPayments,
  getAllPayments,
};

export default paymentService;
