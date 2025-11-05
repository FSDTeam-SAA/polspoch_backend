import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import productService from "./product.service";

const addNewProduct = catchAsync(async (req, res) => {
  const result = await productService.addNewProduct(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Product added successfully",
    data: result,
  });
});

const productController = {
  addNewProduct,
};

export default productController;
