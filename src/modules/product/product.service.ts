import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/cloudinary";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";

const addNewProduct = async (
  payload: IProduct,
  files: Express.Multer.File[]
) => {
  let images: { public_id: string; url: string }[] = [];

  // ----- Handle file uploads -----
  if (files && files.length > 0) {
    const uploadPromises = files.map((file: Express.Multer.File) =>
      uploadToCloudinary(file.path, "products")
    );
    const uploadedResults = await Promise.all(uploadPromises);

    images = uploadedResults.map((uploaded: any) => ({
      public_id: uploaded.public_id ?? "",
      url: uploaded.secure_url,
    }));

    // Delete old images if provided
    if (payload.images && payload.images.length > 0) {
      const oldImagesPublicIds = payload.images.map(
        (img) => img.public_id ?? ""
      );
      await Promise.all(
        oldImagesPublicIds.map((publicId) => deleteFromCloudinary(publicId))
      );
    }
  } else {
    images = (payload.images || []).map((img) => ({
      public_id: img.public_id ?? "",
      url: img.url ?? "",
    }));
  }

  const result = await Product.create({
    ...payload,
    images,
  });

  return result;
};

//! Pagination,searching,sorting and filtering is not completed.
const getAllProducts = async () => {
  const result = await Product.find({});
  return result;
};

const getSingeProduct = async (productId: string) => {
  const existingProduct = await Product.findById(productId);
  if (!existingProduct)
    throw new AppError("Product not found", StatusCodes.NOT_FOUND);

  const result = await Product.findById(productId);
  return result;
};

const updateProduct = async (
  payload: IProduct,
  productId: string,
  files: Express.Multer.File[]
) => {
  const existingProduct = await Product.findById(productId);
  if (!existingProduct)
    throw new AppError("Product not found", StatusCodes.NOT_FOUND);

  let images: { public_id: string; url: string }[] = [];

  // ----- Handle file uploads -----
  if (files && files.length > 0) {
    const uploadPromises = files.map((file: Express.Multer.File) =>
      uploadToCloudinary(file.path, "products")
    );
    const uploadedResults = await Promise.all(uploadPromises);

    images = uploadedResults.map((uploaded: any) => ({
      public_id: uploaded.public_id ?? "",
      url: uploaded.secure_url,
    }));

    // Delete old images if provided
    if (payload.images && payload.images.length > 0) {
      const oldImagesPublicIds = payload.images.map(
        (img) => img.public_id ?? ""
      );
      await Promise.all(
        oldImagesPublicIds.map((publicId) => deleteFromCloudinary(publicId))
      );
    }
  } else {
    images = (payload.images || []).map((img) => ({
      public_id: img.public_id ?? "",
      url: img.url ?? "",
    }));
  }

  const result = await Product.findOneAndUpdate(
    { _id: productId },
    { ...payload, images },
    { new: true }
  );
  return result;
};


//! i things there add some logic if any user order this product which one delete then add error message.
const deleteProduct = async (productId: string) => {
  const isExistingProduct = await Product.findById(productId);
  if (!isExistingProduct)
    throw new AppError("Product not found", StatusCodes.NOT_FOUND);

  await Product.findByIdAndDelete(productId);
};

const productService = {
  addNewProduct,
  getAllProducts,
  getSingeProduct,
  updateProduct,
  deleteProduct,
};

export default productService;
