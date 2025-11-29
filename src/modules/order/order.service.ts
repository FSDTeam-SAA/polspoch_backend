import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import Cart from "../cart/cart.model";
import { Product } from "../product/product.model";
import { Service } from "../service/service.model";
import { User } from "../user/user.model";
import { ICartItem, IOrder } from "./order.interface";
import { Order } from "./order.model";


const createNewOrder = async (payload: IOrder, email: string) => {
 
};

const getMyOrders = async (email: string, page: number, limit: number) => {
  const isExistingUser = await User.isUserExistByEmail(email);
  if (!isExistingUser) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  const result = await Order.find({ userId: isExistingUser._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
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
    });

  return {
    data: result,
    meta: {
      total: await Order.countDocuments({ userId: isExistingUser._id }),
      page,
      limit,
      totalPages: Math.ceil(
        (await Order.countDocuments({ userId: isExistingUser._id })) / limit
      ),
    },
  };
};

const getAllOrders = async (page: number, limit: number) => {
  const result = await Order.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
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
    });

  return {
    data: result,
    meta: {
      total: await Order.countDocuments(),
      page,
      limit,
      totalPages: Math.ceil((await Order.countDocuments()) / limit),
    },
  };
};

const orderService = {
  createNewOrder,
  getMyOrders,
  getAllOrders,
};

export default orderService;
