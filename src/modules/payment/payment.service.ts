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
          currency: "eur",
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
   await Payment.findByIdAndUpdate(paymentRecord._id, {
  checkoutSessionId: session.id,
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

  const result = await Payment.find({ userId: user._id }).populate({
    path: "orderId",
    populate: [
      {
        path: "product.productId",
        model: "Product",
        select: "productName price",
      },
      { path: "serviceId", model: "Service" },
      {
        path: "cartItems.cartId",
        model: "Cart",
        populate: [
          { path: "serviceId", model: "Service" },
          {
            path: "product.productId",
            model: "Product",
            select: "productName price",
          },
        ],
      },
    ],
  });

  return result;
};

const getAllPayments = async () => {
  const payments = await Payment.find({ status: "success" })
    .populate({
      path: "userId",
      select: "name email companyName",
    })
    .populate({
      path: "orderId",
      populate: [
        { path: "product.productId", model: "Product" },
        { path: "serviceId", model: "Service" },
        {
          path: "cartItems.cartId",
          model: "Cart",
          populate: [
            { path: "serviceId", model: "Service" },
            { path: "product.productId", model: "Product" },
          ],
        },
      ],
    });

  const result = payments.map((payment: any) => {
    const p = JSON.parse(JSON.stringify(payment));
    const order = p.orderId;
    if (!order) return p;

    /*
    ─────────────────────────────────────
      HANDLE DIRECT ORDER PRODUCT (NOT CART)
    ─────────────────────────────────────
    */
    if (order.product?.productId) {
      const productDoc = order.product.productId;
      const featuredId = order.product.featuredId;

      if (productDoc?.features?.length) {
        const matchedFeature = productDoc.features.find(
          (f: any) => f._id === featuredId
        );

        order.product.selectedFeature = matchedFeature || null;
        delete order.product.productId.features;
      }
    }

    /*
    ─────────────────────────────────────
      HANDLE CART ITEMS
    ─────────────────────────────────────
    */
    if (order.type === "cart" && order.cartItems?.length > 0) {
      order.cartItems = order.cartItems.map((item: any) => {
        const cartItem = item.cartId;
        if (!cartItem) return item;

        /*
        -------- SERVICE CART ITEM --------
        */
        if (cartItem.type === "service" && cartItem.serviceId) {
          cartItem.service = cartItem.serviceId;
          delete cartItem.serviceId;
        }

        /*
        -------- PRODUCT CART ITEM --------
        */
        if (cartItem.type === "product" && cartItem.product) {
          const productDoc = cartItem.product.productId;
          const featuredId = cartItem.product.featuredId;

          if (productDoc?.features?.length) {
            const matchedFeature = productDoc.features.find(
              (f: any) => f._id === featuredId
            );

            cartItem.product.selectedFeature = matchedFeature || null;

            // remove all features except selectedFeature
            delete cartItem.product.productId.features;
          }
        }

        // Return cleaned structure (No duplicates!)
        return { cartId: cartItem };
      });
    }

    return p;
  });

  return result;
};

const getSinglePayment = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId)
    .populate({
      path: "userId",
      select: "name email companyName",
    })
    .populate({
      path: "orderId",
      populate: [
        { path: "product.productId", model: "Product" },
        { path: "serviceId", model: "Service" },
        {
          path: "cartItems.cartId",
          model: "Cart",
          populate: [
            { path: "serviceId", model: "Service" },
            { path: "product.productId", model: "Product" },
          ],
        },
      ],
    });

  if (!payment) return null;

  // Convert doc → plain object
  const p = JSON.parse(JSON.stringify(payment));
  const order = p.orderId;

  if (!order) return p;

  // DIRECT ORDER PRODUCT

  if (order.product?.productId) {
    const productDoc = order.product.productId;
    const featuredId = order.product.featuredId;

    if (productDoc?.features?.length) {
      const matchedFeature = productDoc.features.find(
        (f: any) => f._id === featuredId
      );

      order.product.selectedFeature = matchedFeature || null;
      delete order.product.productId.features;
    }
  }

  /*

    CART ITEMS

  */
  if (order.type === "cart" && order.cartItems?.length > 0) {
    order.cartItems = order.cartItems.map((item: any) => {
      const cartItem = item.cartId;
      if (!cartItem) return item;

      /*
      ------- SERVICE -------
      */
      if (cartItem.type === "service" && cartItem.serviceId) {
        cartItem.service = cartItem.serviceId;
        delete cartItem.serviceId;
      }

      /*
      ------- PRODUCT -------
      */
      if (cartItem.type === "product" && cartItem.product) {
        const productDoc = cartItem.product.productId;
        const featuredId = cartItem.product.featuredId;

        if (productDoc?.features?.length) {
          const matchedFeature = productDoc.features.find(
            (f: any) => f._id === featuredId
          );

          cartItem.product.selectedFeature = matchedFeature || null;

          // keep only selected feature
          delete cartItem.product.productId.features;
        }
      }

      return { cartId: cartItem }; 
    });
  }

  return p;
};

const paymentService = {
  createPayment,
  getMyPayments,
  getAllPayments,
  getSinglePayment,
};

export default paymentService;
