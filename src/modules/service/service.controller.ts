import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import productService from "../product/product.service";

const createNewService = catchAsync(async (req, res) => {
  const files: any = req.files;
  const result = await productService.addNewProduct(req.body, files);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Service added successfully",
    data: result,
  });
});

const serviceController = {
  createNewService,
};

export default serviceController;
