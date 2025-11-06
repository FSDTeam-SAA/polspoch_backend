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

const productService = {
  addNewProduct,
  getAllProducts,
};

export default productService;
