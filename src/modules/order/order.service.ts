import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import Cart from "../cart/cart.model";
import { IProductFeature } from "../product/product.interface";
import { Product } from "../product/product.model";
import { Service } from "../service/service.model";
import { User } from "../user/user.model";
import { IOrder } from "./order.interface";
import { Order } from "./order.model";

const createNewOrder = async (payload: IOrder, email: string) => {
  // ১. ইউজার চেক
  const user = await User.isUserExistByEmail(email);
  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  // ২. Product order
  if (payload.type === "product") {
    if (!payload.product || !payload.product.productId) {
      throw new AppError("Product info is required", StatusCodes.BAD_REQUEST);
    }

    const product = await Product.findById(payload.product.productId).lean();
    if (!product) {
      throw new AppError("Product not found", StatusCodes.NOT_FOUND);
    }

    // feature select
    let featureData: IProductFeature;
    if (payload.product.featuredId) {
      featureData = product.features.find(
        (f) =>
          (f as any)._id.toString() === payload.product.featuredId?.toString()
      ) as IProductFeature;
      if (!featureData) {
        throw new AppError("Selected feature not found", StatusCodes.NOT_FOUND);
      }
    } else {
      featureData = product.features[0];
    }

    // ৩. Validate mutually exclusive fields
    if (payload.product.unitSize && payload.product.range) {
      throw new AppError(
        "You can select either unitSize or range, not both.",
        StatusCodes.BAD_REQUEST
      );
    }
    if (!payload.product.unitSize && !payload.product.range) {
      throw new AppError(
        "You must select either unitSize or range.",
        StatusCodes.BAD_REQUEST
      );
    }

    // ৪. Quantity / range validation
    const quantity = payload.quantity || 1;
    if (
      (product.minRange && quantity < product.minRange) ||
      (product.maxRange && quantity > product.maxRange)
    ) {
      throw new AppError(
        `Quantity must be between ${product.minRange} and ${product.maxRange}`,
        StatusCodes.BAD_REQUEST
      );
    }

    // ৫. totalAmount calculation
    // if (payload.product.unitSize) {
    //   totalAmount = quantity * featureData.miterPerUnitPrice;
    // } else if (payload.product.range) {
    //   totalAmount = payload.product.range * featureData.miterPerUnitPrice;
    // }
  }

  // ৬. Service order
  if (payload.type === "service") {
    if (!payload.serviceId) {
      throw new AppError("ServiceId is required", StatusCodes.BAD_REQUEST);
    }
    const service = await Service.findById(payload.serviceId).lean();
    if (!service) {
      throw new AppError("Service not found", StatusCodes.NOT_FOUND);
    }
    // totalAmount = service.price || 0;
  }

  // ৭. Cart order
  if (payload.type === "cart") {
    if (!payload.cartItems || payload.cartItems.length === 0) {
      throw new AppError("Cart is empty", StatusCodes.BAD_REQUEST);
    }

    for (const item of payload.cartItems) {
      const cartItem = await Cart.findById(item.cartId).lean();
      if (!cartItem) {
        throw new AppError(
          `Cart item ${item.cartId} not found`,
          StatusCodes.NOT_FOUND
        );
      }
      // totalAmount += (cartItem as any).pricePerUnit * item.quantity;
    }
  }

  // ৮. Order create
  const newOrder = await Order.create({
    userId: user._id,
    product: payload.product,
    serviceId: payload.serviceId,
    cartItems: payload.cartItems,
    type: payload.type,
    quantity: payload.quantity,
    totalAmount: payload.totalAmount,
    status: "pending",
    paymentStatus: "unpaid",
    purchaseDate: new Date(),
  });

  return newOrder;
};

const getMyOrders = async (email: string, page: number, limit: number) => {
  const user = await User.isUserExistByEmail(email);
  if (!user) throw new AppError("User not found", 404);

  const [orders, totalOrders] = await Promise.all([
    Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "userId",
        select: "firstName lastName email companyName",
      })
      .populate({
        path: "product.productId",
        select:
          "productName family productImage features._id features.reference features.size1 features.size2 features.thickness features.finishQuality features.unitSizes features.kgsPerUnit features.miterPerUnitPrice",
      })
      .lean(),
    Order.countDocuments({ userId: user._id }),
  ]);

  const ordersWithFeature = orders.map((order: any) => {
    const product = order?.product?.productId as any;
    const featuredId = order?.product?.featuredId;
    if (product && featuredId) {
      order.product.featuredData =
        (product.features || []).find(
          (f: any) => f._id.toString() === featuredId.toString()
        ) || null;
    }
    return order;
  });

  return {
    data: ordersWithFeature,
    meta: {
      total: totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    },
  };
};


const getAllOrders = async (page: number, limit: number) => {
  // Fetch orders and total count in parallel
  const [orders, totalOrders] = await Promise.all([
    Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "userId",
        select: "firstName lastName email companyName",
      })
      .populate({
        path: "product.productId",
        select:
          "productName family productImage features._id features.reference features.size1 features.size2 features.thickness features.finishQuality features.unitSizes features.kgsPerUnit features.miterPerUnitPrice",
      })
      .lean(),
    Order.countDocuments(),
  ]);

  // Manual populate featuredData for each order
  const ordersWithFeature = orders.map((order: any) => {
    const product = order?.product?.productId as any;
    const featuredId = order?.product?.featuredId;

    if (product && featuredId) {
      order.product.featuredData =
        (product.features || []).find(
          (f: any) => f._id.toString() === featuredId.toString()
        ) || null;
    }

    return order;
  });

  // Return optimized response
  return {
    success: true,
    message: "Orders get successfully",
    statusCode: 200,
    data: ordersWithFeature, // only array
    meta: {
      total: totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    },
  };
};


const orderService = {
  createNewOrder,
  getMyOrders,
  getAllOrders,
};

export default orderService;
