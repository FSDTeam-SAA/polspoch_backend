import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Product } from "../product/product.model";
import Service from "../service/service.model";
import { User } from "../user/user.model";
import { ICart } from "./cart.interface";
import Cart from "./cart.model";

const addToCart = async (payload: ICart, email: string) => {
  const { product, serviceId, quantity = 1, type } = payload;

  // Validate user
  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", StatusCodes.NOT_FOUND);

  // -------------------------------------------------------
  // 🟦 ADD PRODUCT TO CART
  // -------------------------------------------------------
  if (type === "product") {
    if (!product?.productId) {
      throw new AppError("Product ID missing", StatusCodes.BAD_REQUEST);
    }

    const isProductExist = await Product.findById(product.productId);
    if (!isProductExist) {
      throw new AppError("Product not found", StatusCodes.NOT_FOUND);
    }

    // Check if product already in cart
    const existingCart = await Cart.findOne({
      userId: user._id,
      "product.productId": product.productId,
    });

    if (existingCart) {
      await Cart.findByIdAndUpdate(existingCart._id, {
        $inc: { quantity },
      });
      return { message: "Product quantity updated in cart" };
    }

    // Create new cart item
    const newCart = await Cart.create({
      userId: user._id,
      product: {
        productId: product.productId,
        featuredId: product.featuredId,
        size: product.size,
        unitSize: product.unitSize,
        range: product.range,
      },
      quantity,
      type: "product",
    });

    return newCart;
  }

  // -------------------------------------------------------
  // 🟩 ADD SERVICE TO CART
  // -------------------------------------------------------
  if (type === "service") {
    if (!serviceId) {
      throw new AppError("Service ID missing", StatusCodes.BAD_REQUEST);
    }

    const isServiceExist = await Service.findById(serviceId);
    if (!isServiceExist) {
      throw new AppError("Service not found", StatusCodes.NOT_FOUND);
    }

    // Check if already added
    const existingCart = await Cart.findOne({
      userId: user._id,
      serviceId,
    });

    if (existingCart) {
      await Cart.findByIdAndUpdate(existingCart._id, {
        $inc: { quantity },
      });
      return { message: "Service quantity updated in cart" };
    }

    const newCart = await Cart.create({
      userId: user._id,
      serviceId,
      type: "service",
      quantity,
    });

    return newCart;
  }

  throw new AppError("Invalid cart type", StatusCodes.BAD_REQUEST);
};

const getMyCart = async (email: string, page: number, limit: number) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", StatusCodes.NOT_FOUND);

  const skip = (page - 1) * limit;

  const carts = await Cart.find({ userId: user._id })
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

  // Convert mongoose docs to JSON
  const cleanCarts = JSON.parse(JSON.stringify(carts));

  // Add selectedFeature logic
  const formatted = cleanCarts.map((cart: any) => {
    if (cart.type === "product" && cart.product) {
      const productDoc = cart.product.productId;
      const featuredId = cart.product.featuredId;

      if (productDoc && featuredId && productDoc.features) {
        // Find matched feature
        const matchedFeature = productDoc.features.find(
          (f: any) => f._id === featuredId
        );

        // Add selectedFeature
        cart.product.selectedFeature = matchedFeature || null;

        // Remove full features array
        delete cart.product.productId.features;
      }
    }

    return cart;
  });

  const total = await Cart.countDocuments({ userId: user._id });

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

const increaseQuantity = async (email: string, cartId: string) => {
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) throw new AppError("User not found", StatusCodes.NOT_FOUND);

  const isCartExist = await Cart.findById(cartId);
  if (!isCartExist) throw new AppError("Cart not found", StatusCodes.NOT_FOUND);

  const updatedCart = await Cart.findByIdAndUpdate(
    cartId,
    { $inc: { quantity: 1 } },
    { new: true }
  );

  return updatedCart;
};

const deletedCart = async (email: string, cartId: string) => {
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) throw new AppError("User not found", StatusCodes.NOT_FOUND);

  const isCartExist = await Cart.findById(cartId);
  if (!isCartExist) throw new AppError("Cart not found", StatusCodes.NOT_FOUND);

  await Cart.findByIdAndDelete(cartId);
};

const cartService = {
  addToCart,
  getMyCart,
  deletedCart,
  increaseQuantity,
};

export default cartService;
