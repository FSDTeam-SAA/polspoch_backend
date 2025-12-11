import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import Cart from "../cart/cart.model";
import { IProductFeature } from "../product/product.interface";
import { Product } from "../product/product.model";
import Service from "../service/service.model";
import { User } from "../user/user.model";
import { IOrder } from "./order.interface";
import { Order } from "./order.model";

const createNewOrder = async (payload: IOrder, email: string) => {
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

  const skip = (page - 1) * limit;

  const [orders, totalOrders] = await Promise.all([
    Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        select: "firstName lastName email companyName",
      })
      .populate({
        path: "product.productId",
        model: "Product",
      })
      .populate({
        path: "serviceId",
        model: "Service",
      })
      .populate({
        path: "cartItems.cartId",
        model: "Cart",
        populate: [
          { path: "serviceId", model: "Service" },
          { path: "product.productId", model: "Product" },
        ],
      })
      .lean(),

    Order.countDocuments({ userId: user._id }),
  ]);

  /*
  ─────────────────────────────────────────────
      FORMAT ORDER + FEATURE LOGIC
  ─────────────────────────────────────────────
  */

  const formattedOrders = orders.map((order: any) => {
    /*
    --------------------------------
      DIRECT PRODUCT ORDER
    --------------------------------
    */
    if (order.product?.productId) {
      const productDoc = order.product.productId;
      const featuredId = order.product.featuredId;

      if (productDoc?.features?.length) {
        const matchedFeature = productDoc.features.find(
          (f: any) => f._id.toString() === featuredId?.toString()
        );

        order.product.selectedFeature = matchedFeature || null;
        delete order.product.productId.features;
      }
    }

    /*
    --------------------------------
      CART ORDER
    --------------------------------
    */
    if (order.type === "cart" && order.cartItems?.length > 0) {
      order.cartItems = order.cartItems.map((item: any) => {
        const cartItem = item.cartId;
        if (!cartItem) return item;

        // SERVICE INSIDE CART
        if (cartItem.type === "service" && cartItem.serviceId) {
          cartItem.service = cartItem.serviceId;
          delete cartItem.serviceId;
        }

        // PRODUCT INSIDE CART
        if (cartItem.type === "product" && cartItem.product) {
          const productDoc = cartItem.product.productId;
          const featuredId = cartItem.product.featuredId;

          if (productDoc?.features?.length) {
            const matchedFeature = productDoc.features.find(
              (f: any) => f._id.toString() === featuredId?.toString()
            );

            cartItem.product.selectedFeature = matchedFeature || null;
            delete cartItem.product.productId.features;
          }
        }

        return { cartId: cartItem };
      });
    }

    return order;
  });

  /*
  ─────────────────────────────────────────────
      FINAL RESPONSE
  ─────────────────────────────────────────────
  */

  return {
    data: formattedOrders,
    meta: {
      total: totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    },
  };
};

const getAllOrders = async (
  page: number,
  limit: number,
  search?: string,
  status?: string,
  paymentStatus?: string,
  sortBy?: "paid" | "unpaid"
) => {
  const skip = (page - 1) * limit;

  const query: any = {};

  if (status && ["pending", "delivered", "rejected"].includes(status)) {
    query.status = status;
  }

  if (paymentStatus && ["paid", "unpaid"].includes(paymentStatus)) {
    query.paymentStatus = paymentStatus;
  }

  if (search) {
    const users = await User.find({
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const userIds = users.map((u) => u._id);
    query.userId = { $in: userIds };
  }

  const sortOptions: any = {};
  if (sortBy === "paid") sortOptions.paymentStatus = 1;
  else if (sortBy === "unpaid") sortOptions.paymentStatus = -1;
  else sortOptions.createdAt = -1;

  const [orders, totalOrders] = await Promise.all([
    Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        select: "firstName lastName email companyName",
      })
      .populate({ path: "product.productId", model: "Product" })
      .populate({ path: "serviceId", model: "Service" })
      .populate({
        path: "cartItems.cartId",
        model: "Cart",
        populate: [
          { path: "serviceId", model: "Service" },
          { path: "product.productId", model: "Product" },
        ],
      })
      .lean(),

    Order.countDocuments(query),
  ]);

  const formattedOrders = orders.map((order: any) => {
    if (order.product?.productId) {
      const productDoc = order.product.productId;
      const featuredId = order.product.featuredId;

      if (productDoc?.features?.length) {
        const matchedFeature = productDoc.features.find(
          (f: any) => f._id.toString() === featuredId?.toString()
        );

        order.product.selectedFeature = matchedFeature || null;
        delete order.product.productId.features;
      }
    }

    // Cart orders
    if (order.type === "cart" && order.cartItems?.length > 0) {
      order.cartItems = order.cartItems.map((item: any) => {
        const cartItem = item.cartId;
        if (!cartItem) return item;

        // Service inside cart
        if (cartItem.type === "service" && cartItem.serviceId) {
          cartItem.service = cartItem.serviceId;
          delete cartItem.serviceId;
        }

        // Product inside cart
        if (cartItem.type === "product" && cartItem.product) {
          const productDoc = cartItem.product.productId;
          const featuredId = cartItem.product.featuredId;

          if (productDoc?.features?.length) {
            const matchedFeature = productDoc.features.find(
              (f: any) => f._id.toString() === featuredId?.toString()
            );

            cartItem.product.selectedFeature = matchedFeature || null;
            delete cartItem.product.productId.features;
          }
        }

        return { cartId: cartItem };
      });
    }

    return order;
  });

  return {
    success: true,
    message: "Orders retrieved successfully",
    statusCode: 200,
    data: formattedOrders,
    meta: {
      total: totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    },
  };
};

const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", StatusCodes.NOT_FOUND);
  }

  if (order.paymentStatus !== "paid") {
    throw new AppError(
      "Cannot update status of unpaid order",
      StatusCodes.BAD_REQUEST
    );
  }

  await Order.findByIdAndUpdate(orderId, { status }, { new: true });
};

const orderService = {
  createNewOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};

export default orderService;
