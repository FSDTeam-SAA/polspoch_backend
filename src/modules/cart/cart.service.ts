import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Product } from "../product/product.model";
import { Service } from "../service/service.model";
import { User } from "../user/user.model";
import { ICart } from "./cart.interface";
import Cart from "./cart.model";

const addToCart = async (payload: ICart, email: string) => {
  const { productId, serviceId, quantity = 1, type, userId } = payload;

  if (type === "product") {
    const isUserExist = await User.findOne({ email });
    if (!isUserExist)
      throw new AppError("User not found", StatusCodes.NOT_FOUND);

    const isProductExist = await Product.findById(productId);
    if (!isProductExist)
      throw new AppError("Product not found", StatusCodes.NOT_FOUND);

    const existingCart = await Cart.findOne({ userId, productId });
    if (existingCart) {
      await Cart.findByIdAndUpdate(existingCart._id, {
        $inc: { quantity },
      });
      return { message: "Product quantity updated in cart" };
    }

    const result = await Cart.create({
      userId: isUserExist._id,
      productId,
      quantity,
      type,
    });

    return result;
  }

  if (type === "service") {
    const isUserExist = await User.findOne({ email });
    if (!isUserExist)
      throw new AppError("User not found", StatusCodes.NOT_FOUND);

    const isServiceExist = await Service.findById(serviceId);
    if (!isServiceExist)
      throw new AppError("Service not found", StatusCodes.NOT_FOUND);

    const existingCart = await Cart.findOne({ userId, serviceId });
    if (existingCart) {
      await Cart.findByIdAndUpdate(existingCart._id, {
        $inc: { quantity },
      });
      return { message: "Service quantity updated in cart" };
    }

    const result = await Cart.create({
      userId: isUserExist._id,
      serviceId,
      quantity,
      type,
    });

    return result;
  }
};

const getMyCart = async (email: string, page: number, limit: number) => {
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) throw new AppError("User not found", StatusCodes.NOT_FOUND);

  const skip = (page - 1) * limit;

  const carts = await Cart.find({ userId: isUserExist._id })
    .populate({
      path: "userId",
      select: "firstName lastName",
    })
    .populate({
      path: "productId",
      select: "productName images price",
    })
    .populate({
      path: "serviceId",
      select: "serviceName images price",
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Cart.countDocuments({ userId: isUserExist._id });

  return {
    data: carts,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const cartService = {
  addToCart,
  getMyCart,
};

export default cartService;
