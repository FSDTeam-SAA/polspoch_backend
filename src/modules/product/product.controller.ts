import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/cloudinary";
import sendResponse from "../../utils/sendResponse";
import { FamilyService, ProductService } from "./product.service";
import { Product } from "./product.model";
import { ShippingPolicy } from "../shippingPolicy/shipping.model";

/**
 * Calculate product quote with pricing and shipping
 * Similar to service quote endpoints, returns product price separately from shipping
*/
const calculateProductQuote = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { productId, featuredId, quantity } = req.body;

  if (!productId || !featuredId || !quantity) {
    res.status(400).json({
      success: false,
      message: "productId, featuredId, and quantity are required",
    });
    return;
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
    return;
  }

  const feature = product.features.find(
    (f: any) => f._id?.toString() === featuredId
  );
  if (!feature) {
    res.status(404).json({
      success: false,
      message: "Product feature not found",
    });
    return;
  }

  // Calculate product price
  const miterPerUnitPrice = feature.miterPerUnitPrice;
  const productPrice = Number((miterPerUnitPrice * quantity).toFixed(2));

  // Calculate weight for shipping
  const kgsPerUnit = feature.kgsPerUnit || 0;
  const totalWeight = Number((kgsPerUnit * quantity).toFixed(2));

  // Estimate dimension (use max of size1, size2 if available)
  let maxDimension = 1000; // Default assumption
  if (feature.size1 || feature.size2) {
    maxDimension = Math.max(feature.size1 || 0, feature.size2 || 0);
  }

  // Get shipping policies
  const [courier, truck] = await Promise.all([
    ShippingPolicy.findOne({ methodName: "courier" }).lean(),
    ShippingPolicy.findOne({ methodName: "truck" }).lean(),
  ]);

  // Calculate shipping
  let shippingCost = 0;
  let shippingMethod = "courier";

  if (courier && truck) {
    if (maxDimension <= courier.maxSizeAllowed) {
      shippingMethod = "courier";
      let cost = courier.basePrice;
      if (totalWeight > courier.freeWeightLimit) {
        cost +=
          (totalWeight - courier.freeWeightLimit) *
          courier.extraWeightPrice;
      }
      if (maxDimension >= courier.sizeThreshold) {
        cost += courier.sizeSurcharge;
      }
      shippingCost = Math.min(cost, courier.maxTotalCost);
    } else {
      shippingMethod = "truck";
      shippingCost = truck.basePrice;
    }
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product quote calculated successfully",
    data: {
      summary: {
        productName: product.productName,
        reference: feature.reference,
        finishQuality: feature.finishQuality,
        quantity,
        totalWeight: Number(totalWeight.toFixed(2)),
        maxDimension,
      },
      pricing: {
        miterPerUnitPrice,
        productPrice,
        // IMPORTANT: shippingPrice is FOR DISPLAY ONLY
        shippingPrice: Number(shippingCost.toFixed(2)),
        // finalQuote = product price only (for order calculation)
        finalQuote: productPrice,
        // finalQuoteWithShipping = for display/UI purposes
        finalQuoteWithShipping: Number((productPrice + shippingCost).toFixed(2)),
      },
      shippingStatus: {
        method: shippingMethod,
        isOversized: maxDimension > (courier?.maxSizeAllowed || 2500),
        maxDimensionDetected: maxDimension,
      },
    },
  });
});

export const ProductController = {
  calculateProductQuote,
  createProduct: async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      const body = req.body;

      const uploadedImages: { url: string; publickey: string }[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const uploaded = await uploadToCloudinary(file.path, "products");
          uploadedImages.push({
            url: uploaded.secure_url,
            publickey: uploaded.public_id,
          });
        }
      }
      // 2️⃣ Handle features
      let features = body.features;
      if (typeof features === "string") {
        // form-data sends features as JSON string
        features = JSON.parse(features);
      }

      const data = {
        ...body,
        features,
        productImage: uploadedImages,
      };

      const result = await ProductService.createProduct(data);

      res.json({
        success: true,
        message: "Product added successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAllProducts: catchAsync(async (req, res) => {
    const { family, search } = req.query;

    const result = await ProductService.getAllProducts({
      family: family as string,
      search: search as string,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Products fetched successfully",
      data: result,
    });
  }),

  getSingleProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await ProductService.getSingleProduct(id);

      if (!product) {
        res.status(404).json({ success: false, message: "Not found" });
        return;
      }

      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateProduct: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const body = req.body;
      const files = req.files as Express.Multer.File[];

      const existing = await ProductService.getSingleProduct(id);
      if (!existing) {
        res.status(404).json({ success: false, message: "Not found" });
        return;
      }

      let updatedImages: { url: string; publickey: string }[] = [];

      // Handle existingImages field from frontend
      if (body.existingImages) {
        const existingImagesArr = JSON.parse(body.existingImages);

        // Find images to delete (those not in existingImages array)
        const existingPublicKeys = existingImagesArr.map(
          (img: any) => img.publickey,
        );
        const imagesToDelete = existing.productImage.filter(
          (img) => !existingPublicKeys.includes(img.publickey),
        );

        // Delete removed images from cloudinary
        for (const img of imagesToDelete) {
          await deleteFromCloudinary(img.publickey);
        }

        // Keep only the images that were sent in existingImages
        updatedImages = existingImagesArr;
      } else {
        // If no existingImages field, keep all existing images
        updatedImages = [...existing.productImage];
      }

      // Add new uploaded images
      if (files && files.length > 0) {
        for (const file of files) {
          const uploaded = await uploadToCloudinary(file.path, "products");
          updatedImages.push({
            url: uploaded.secure_url,
            publickey: uploaded.public_id,
          });
        }
      }

      const payload = {
        ...body,
        features: JSON.parse(body.features || "[]"),
        productImage: updatedImages,
      };

      const updated = await ProductService.updateProduct(id, payload);

      res.json({
        success: true,
        message: "Product updated successfully",
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteProduct: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const product = await ProductService.getSingleProduct(id);
      if (!product) {
        res.status(404).json({ success: false, message: "Not found" });
        return;
      }

      // Delete images from cloudinary
      for (const img of product.productImage) {
        await deleteFromCloudinary(img.publickey);
      }

      await ProductService.deleteProduct(id);

      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  multipleProductUpdate: async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const updated = await ProductService.multipleProductUpdate(file);

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Products updated successfully",
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

export const FamilyController = {
  createFamily: catchAsync(async (req: Request, res: Response) => {
    const body = req.body;
    const file = req.file;

    let img = undefined;

    if (file) {
      const uploaded = await uploadToCloudinary(file.path, "families");
      img = {
        url: uploaded.secure_url,
        publickey: uploaded.public_id,
      };
    }

    const result = await FamilyService.createFamily({
      familyName: body.familyName,
      img,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Family created successfully",
      data: result,
    });
  }),

  getAllFamilies: catchAsync(async (_req, res) => {
    const result = await FamilyService.getAllFamilies();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Families fetched successfully",
      data: result,
    });
  }),

  getSingleFamily: catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await FamilyService.getSingleFamily(id);

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Family not found",
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  }),

  updateFamily: catchAsync(async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const file = req.file;

    const existing = await FamilyService.getSingleFamily(id);
    if (!existing) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Family not found",
      });
    }

    let img = existing.img;

    if (file) {
      if (img?.publickey) {
        await deleteFromCloudinary(img.publickey);
      }

      const uploaded = await uploadToCloudinary(file.path, "families");
      img = {
        url: uploaded.secure_url,
        publickey: uploaded.public_id,
      };
    }

    const updated = await FamilyService.updateFamily(id, {
      familyName: body.familyName ?? existing.familyName,
      img,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Family updated successfully",
      data: updated,
    });
  }),

  deleteFamily: catchAsync(async (req, res) => {
    const { id } = req.params;

    const existing = await FamilyService.getSingleFamily(id);
    if (!existing) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Family not found",
      });
    }

    if (existing.img?.publickey) {
      await deleteFromCloudinary(existing.img.publickey);
    }

    await FamilyService.deleteFamily(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Family deleted successfully",
    });
  }),
};
