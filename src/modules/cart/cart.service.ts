import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";
import { ShippingPolicy } from "../shippingPolicy/shipping.model";

import Cart from "./cart.model";
import { ICart } from "./cart.interface";

const addToCart = async (
  payload: ICart,
  identity: { email?: string; guestId?: string }
) => {
  const { product, serviceData, quantity = 1, type, totalAmount } = payload;

  let userId = undefined;
  if (identity.email) {
    const user = await User.findOne({ email: identity.email });
    if (user) userId = user._id;
  }

  const identityQuery = userId ? { userId } : { guestId: identity.guestId };

  if (!userId && !identity.guestId) {
    throw new AppError(
      "Identification required (User or Guest ID)",
      StatusCodes.BAD_REQUEST
    );
  }

  // 🟦 ADD PRODUCT TO CART
  if (type === "product") {
    if (!product?.productId) {
      throw new AppError("Product ID missing", StatusCodes.BAD_REQUEST);
    }

    const isProductExist = await Product.findById(product.productId);
    if (!isProductExist) {
      throw new AppError("Product not found", StatusCodes.NOT_FOUND);
    }

    const newCart = await Cart.create({
      userId,
      guestId: userId ? undefined : identity.guestId,
      product: {
        productId: product.productId,
        featuredId: product.featuredId,
        size: product.size,
        unitSize: product.unitSize,
        range: product.range,
      },
      quantity,
      type: "product",
      totalAmount,
    });

    return newCart;
  }

  // -------------------------------------------------------
  // 🟩 ADD SERVICE TO CART
  // -------------------------------------------------------
  if (type === "service") {
    if (!serviceData?.serviceType) {
      throw new AppError(
        "Specific service type (rebar/bending/cutting) is required in serviceData",
        StatusCodes.BAD_REQUEST
      );
    }

    const newCart = await Cart.create({
      userId,
      guestId: userId ? undefined : identity.guestId,
      serviceData,
      type: "service",
      quantity,
      totalAmount,
    });

    return newCart;
  }

  throw new AppError(
    "Invalid cart type. Use 'product' or 'service'",
    StatusCodes.BAD_REQUEST
  );
};

const getMyCart = async (
  identity: { email?: string; guestId?: string },
  page: number,
  limit: number
) => {
  let query: any = {};

  if (identity.email) {
    const user = await User.findOne({ email: identity.email });
    if (!user) throw new AppError("User not found", StatusCodes.NOT_FOUND);
    query.userId = user._id;
  } else if (identity.guestId) {
    query.guestId = identity.guestId;
  } else {
    throw new AppError("Identification required", StatusCodes.BAD_REQUEST);
  }

  const skip = (page - 1) * limit;

  const carts = await Cart.find(query)
    .populate({
      path: "userId",
      select: "firstName lastName",
    })
    .populate({
      path: "product.productId",
    })
    .populate({
      path: "serviceId",
      select: "-__v -createdAt -updatedAt",
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const cleanCarts = JSON.parse(JSON.stringify(carts));

  const formatted = cleanCarts.map((cart: any) => {
    if (cart.type === "product" && cart.product?.productId) {
      const productDoc = cart.product.productId;
      const featuredId = cart.product.featuredId;

      if (featuredId && productDoc.features) {
        const matchedFeature = productDoc.features.find(
          (f: any) => f._id === featuredId || f._id === featuredId?._id
        );
        cart.product.selectedFeature = matchedFeature || null;
      }
    }
    return cart;
  });

  const total = await Cart.countDocuments(query);

  return {
    data: formatted,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const increaseQuantity = async (
  identity: { email?: string; guestId?: string },
  cartId: string
) => {
  const isCartExist = await Cart.findById(cartId);
  if (!isCartExist) throw new AppError("Cart not found", StatusCodes.NOT_FOUND);

  // Security check: ensure the cart belongs to the user/guest
  if (identity.email) {
    const user = await User.findOne({ email: identity.email });
    if (!user) throw new AppError("User not found", StatusCodes.NOT_FOUND);

    // Allow if matches userId OR (if userId is not set) matches guestId
    const isOwner =
      isCartExist.userId?.toString() === user._id.toString() ||
      (!isCartExist.userId && isCartExist.guestId === identity.guestId);

    if (!isOwner) {
      throw new AppError("Unauthorized access to cart", StatusCodes.UNAUTHORIZED);
    }
  } else {
    if (!identity.guestId || isCartExist.guestId !== identity.guestId) {
      throw new AppError("Unauthorized access to cart", StatusCodes.UNAUTHORIZED);
    }
  }

  const updatedCart = await Cart.findByIdAndUpdate(
    cartId,
    { $inc: { quantity: 1 } },
    { new: true }
  );

  return updatedCart;
};

const deletedCart = async (
  identity: { email?: string; guestId?: string },
  cartId: string
) => {
  const isCartExist = await Cart.findById(cartId);
  if (!isCartExist) throw new AppError("Cart not found", StatusCodes.NOT_FOUND);

  // Security check
  if (identity.email) {
    const user = await User.findOne({ email: identity.email });
    if (!user) throw new AppError("User not found", StatusCodes.NOT_FOUND);

    const isOwner =
      isCartExist.userId?.toString() === user._id.toString() ||
      (!isCartExist.userId && isCartExist.guestId === identity.guestId);

    if (!isOwner) {
      throw new AppError("Unauthorized access to cart", StatusCodes.UNAUTHORIZED);
    }
  } else {
    if (!identity.guestId || isCartExist.guestId !== identity.guestId) {
      throw new AppError("Unauthorized access to cart", StatusCodes.UNAUTHORIZED);
    }
  }

  await Cart.findByIdAndDelete(cartId);
};

const mergeCart = async (email: string, guestId: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", StatusCodes.NOT_FOUND);

  if (!guestId) return;

  // Transfer all guest items to user and remove the guestId
  await Cart.updateMany(
    { guestId },
    {
      $set: { userId: user._id },
      $unset: { guestId: 1 }
    }
  );
};

/**
 * CHECKOUT FUNCTION - Calculates proper total with shipping ONCE
 * This prevents the double-shipping bug where each item had shipping included
 * 
 * @param identity User or guest identifier
 * @returns { cartItems, subtotal, shippingCost, totalAmount }
 */
const cartCheckout = async (
  identity: { email?: string; guestId?: string }
) => {
  let userId = undefined;
  if (identity.email) {
    const user = await User.findOne({ email: identity.email });
    if (user) userId = user._id;
  }

  const identityQuery = userId ? { userId } : { guestId: identity.guestId };

  // Get all cart items
  const cartItems = await Cart.find(identityQuery)
    .populate({
      path: "product.productId",
      select: "price"
    })
    .populate({
      path: "serviceId",
      select: "price"
    })
    .lean();

  if (!cartItems || cartItems.length === 0) {
    throw new AppError("Cart is empty", StatusCodes.BAD_REQUEST);
  }

  // Calculate subtotal (without shipping)
  let subtotal = 0;
  let totalWeight = 0;
  let maxDimension = 0;

  cartItems.forEach((item: any) => {
    // Add product/service price
    if (item.type === "product" && item.product?.productId?.price) {
      subtotal += (item.product.productId.price || 0) * (item.quantity || 1);
    } else if (item.type === "service" && item.serviceData?.totalWeight) {
      // For services, add product price only (stored in totalAmount before shipping was added)
      // Now with the fix, totalAmount = product price only
      subtotal += item.totalAmount || 0;
      
      // Track dimensions for shipping calculation
      totalWeight += item.serviceData.totalWeight || 0;
      maxDimension = Math.max(maxDimension, item.serviceData.maxDimensionDetected || 0);
    }
  });

  // Calculate shipping ONCE for entire order
  let shippingCost = 0;
  let shippingMethod = "";

  if (maxDimension > 0 && totalWeight > 0) {
    // Has service items, calculate shipping
    const [courier, truck] = await Promise.all([
      ShippingPolicy.findOne({ methodName: "courier" }),
      ShippingPolicy.findOne({ methodName: "truck" }),
    ]);

    if (courier && truck) {
      if (maxDimension <= courier.maxSizeAllowed) {
        shippingMethod = "courier";
        let cost = courier.basePrice;

        if (totalWeight > courier.freeWeightLimit) {
          cost += (totalWeight - courier.freeWeightLimit) * courier.extraWeightPrice;
        }

        if (maxDimension >= courier.sizeThreshold) {
          cost += courier.sizeSurcharge;
        }

        shippingCost = Math.min(cost, courier.maxTotalCost);
      } else {
        shippingMethod = "truck";
        shippingCost = truck.basePrice;
      }
    }
  }

  const totalAmount = subtotal + shippingCost;

  return {
    success: true,
    cartItems: cartItems.map(item => ({
      cartId: item._id,
      type: item.type,
      quantity: item.quantity,
      totalAmount: item.totalAmount
    })),
    pricing: {
      subtotal: Number(subtotal.toFixed(2)),
      shippingCost: Number(shippingCost.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      shippingMethod,
    },
    message: "Checkout calculation ready",
  };
};

const cartService = {
  addToCart,
  getMyCart,
  deletedCart,
  increaseQuantity,
  mergeCart,
  cartCheckout,
};

export default cartService;
