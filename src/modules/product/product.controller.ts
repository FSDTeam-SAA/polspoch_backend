import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import productService from "./product.service";

const addNewProduct = catchAsync(async (req, res) => {
  const files: any = req.files;
  const result = await productService.addNewProduct(req.body, files);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Product added successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const result = await productService.getAllProducts(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Products fetched successfully",
    data: result,
  });
});

const getSingeProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const result = await productService.getSingeProduct(productId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product get successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const files: any = req.files;
  const result = await productService.updateProduct(req.body, productId, files);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  await productService.deleteProduct(productId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product deleted successfully",
  });
});

const productController = {
  addNewProduct,
  getAllProducts,
  getSingeProduct,
  updateProduct,
  deleteProduct,
};

export default productController;
