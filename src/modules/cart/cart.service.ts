import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Product } from "../product/product.model";
import { ICart } from "./cart.interface";
import Cart from "./cart.model";
import { Service } from "../service/service.model";

const addToCart = async (payload: ICart) => {
  const { productId, serviceId, quantity = 1, type, userId } = payload;

  if (type === "product") {
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
      userId,
      productId,
      quantity,
      type, 
    });

    return result;
  }

  if (type === "service") {
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
      userId,
      serviceId,
      quantity,
      type,
    });

    return result;
  }
};


const cartService = {
  addToCart,
};

export default cartService;
