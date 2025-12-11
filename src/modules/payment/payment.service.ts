import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import AppError from "../../errors/AppError";
import { Order } from "../order/order.model";
import { User } from "../user/user.model";
import Payment from "./payment.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

const createPayment = async (
  payload: { orderId: string; totalAmount: number },
  email: string
) => {
  const { orderId, totalAmount } = payload;

  // 1. Check user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  // 2. Check order
  const order = await Order.findOne({ _id: orderId, userId: user._id });
  if (!order) {
    throw new AppError("Order not found", StatusCodes.NOT_FOUND);
  }

  // 3. Create Pending Payment Record
  const paymentRecord = await Payment.create({
    userId: user._id,
    orderId: order._id,
    amount: totalAmount,
    status: "pending",
  });

  // 4. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Order Payment #${orderId}`,
          },
          unit_amount: Math.round(totalAmount * 100), // convert to cents
        },
        quantity: 1,
      },
    ],

    success_url: `${process.env.FRONTEND_URL_SUCCESS}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: process.env.FRONTEND_URL_CANCEL,

    metadata: {
      paymentRecordId: paymentRecord._id.toString(),
      orderId: order._id.toString(),
      userId: user._id.toString(),
    },
  });

  return {
    url: session.url,
  };
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
  const result = await Payment.find({ status: "success" }).populate({
    path: "userId",
    select: "name email companyName",
  });
  return result;
};

const paymentService = {
  createPayment,
  getMyPayments,
  getAllPayments,
};

export default paymentService;
