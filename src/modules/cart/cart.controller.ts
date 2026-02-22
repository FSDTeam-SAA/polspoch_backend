import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import cartService from "./cart.service";

const addToCart = catchAsync(async (req, res) => {
  const identity = {
    email: req.user?.email,
    guestId: req.headers["x-guest-id"] as string
  };
  const cart = await cartService.addToCart(req.body, identity);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product added to cart successfully",
    data: cart,
  });
});

const getMyCart = catchAsync(async (req, res) => {
  const identity = {
    email: req.user?.email,
    guestId: req.headers["x-guest-id"] as string
  };

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await cartService.getMyCart(identity, page, limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cart fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const increaseQuantity = catchAsync(async (req, res) => {
  const identity = {
    email: req.user?.email,
    guestId: req.headers["x-guest-id"] as string
  };
  const { cartId } = req.params;
  const cart = await cartService.increaseQuantity(identity, cartId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cart quantity increased successfully",
    data: cart,
  });
});

const deletedCart = catchAsync(async (req, res) => {
  const identity = {
    email: req.user?.email,
    guestId: req.headers["x-guest-id"] as string
  };
  const { cartId } = req.params;
  await cartService.deletedCart(identity, cartId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cart deleted successfully",
  });
});

const mergeCart = catchAsync(async (req, res) => {
  const { guestId } = req.body;

  if (!req.user) {
    throw new AppError("You must be logged in to merge cart", StatusCodes.UNAUTHORIZED);
  }

  const { email } = req.user;

  await cartService.mergeCart(email, guestId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cart merged successfully",
  });
});

const cartController = {
  addToCart,
  getMyCart,
  increaseQuantity,
  deletedCart,
  mergeCart,
};

export default cartController;
