import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import Cart from "../cart/cart.model";
import { Product } from "../product/product.model";
import { Service } from "../service/service.model";
import { User } from "../user/user.model";
import { ICartItem, IOrder } from "./order.interface";
import Order from "./order.model";

const createNewOrder = async (payload: IOrder, email: string) => {
  const isExistingUser = await User.isUserExistByEmail(email);
  if (!isExistingUser) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  if (!payload.type) {
    throw new AppError("Order type is required", StatusCodes.BAD_REQUEST);
  }

  const orderData: any = {
    userId: isExistingUser._id,
    type: payload.type,
  };

  // 🛒 If type = cart
  if (payload.type === "cart") {
    if (!payload.cartItems || payload.cartItems.length === 0) {
      throw new AppError("Cart items are required", StatusCodes.BAD_REQUEST);
    }

    let totalAmount = 0;

    for (const item of payload.cartItems as ICartItem[]) {
      const cart = await Cart.findById(item.cartId)
        .populate({
          path: "productId",
          select: "price",
        })
        .lean();

      if (!cart) {
        throw new AppError(
          `Cart item not found: ${item.cartId}`,
          StatusCodes.NOT_FOUND
        );
      }

      const product: any = cart.productId;
      const price = product?.price || 0;
      totalAmount += price * (item.quantity || 1);
    }

    orderData.cartItems = payload.cartItems;
    orderData.totalAmount = totalAmount;
  }

  // 📦 If type = product
  else if (payload.type === "product") {
    const product = await Product.findById(payload.productId);
    if (!product)
      throw new AppError("Product not found", StatusCodes.NOT_FOUND);

    orderData.productId = product._id;
    orderData.quantity = payload.quantity || 1;
    orderData.totalAmount = (product.price || 0) * orderData.quantity;
  }

  // 🧰 If type = service
  else if (payload.type === "service") {
    const service = await Service.findById(payload.serviceId);
    if (!service)
      throw new AppError("Service not found", StatusCodes.NOT_FOUND);

    orderData.serviceId = service._id;
    orderData.quantity = payload.quantity || 1;
    orderData.totalAmount = (service.price || 0) * orderData.quantity;
  }

  const result = await Order.create(orderData);
  return result;
};

const orderService = {
  createNewOrder,
};

export default orderService;
