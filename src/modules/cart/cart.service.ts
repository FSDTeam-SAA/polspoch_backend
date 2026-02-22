import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";

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
    if (!user || isCartExist.userId?.toString() !== user._id.toString()) {
      throw new AppError("Unauthorized access to cart", StatusCodes.UNAUTHORIZED);
    }
  } else if (isCartExist.guestId !== identity.guestId) {
    throw new AppError("Unauthorized access to cart", StatusCodes.UNAUTHORIZED);
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
    if (!user || isCartExist.userId?.toString() !== user._id.toString()) {
      throw new AppError("Unauthorized access to cart", StatusCodes.UNAUTHORIZED);
    }
  } else if (isCartExist.guestId !== identity.guestId) {
    throw new AppError("Unauthorized access to cart", StatusCodes.UNAUTHORIZED);
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

const cartService = {
  addToCart,
  getMyCart,
  deletedCart,
  increaseQuantity,
  mergeCart,
};

export default cartService;
