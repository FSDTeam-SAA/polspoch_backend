import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import cartService from "./cart.service";

const addToCart = catchAsync(async (req, res) => {
  const cart = await cartService.addToCart(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product added to cart successfully",
    data: cart,
  });
});

const cartController = {
  addToCart,
};

export default cartController;
