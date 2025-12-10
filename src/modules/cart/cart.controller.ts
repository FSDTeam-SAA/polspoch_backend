import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import cartService from "./cart.service";

const addToCart = catchAsync(async (req, res) => {
  const { email } = req.user;
  const cart = await cartService.addToCart(req.body, email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product added to cart successfully",
    data: cart,
  });
});

const getMyCart = catchAsync(async (req, res) => {
  const { email } = req.user;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await cartService.getMyCart(email, page, limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cart fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const increaseQuantity = catchAsync(async (req, res) => {
  throw new AppError("There some logic error i can't handle", StatusCodes.NOT_FOUND);

  const { email } = req.user;
  const { cartId } = req.params;
  const cart = await cartService.increaseQuantity(email, cartId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cart quantity increased successfully",
    data: cart,
  });
});

const deletedCart = catchAsync(async (req, res) => {
  const { email } = req.user;
  const { cartId } = req.params;
  await cartService.deletedCart(email, cartId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cart deleted successfully",
  });
});

const cartController = {
  addToCart,
  getMyCart,
  increaseQuantity,
  deletedCart,
};

export default cartController;
