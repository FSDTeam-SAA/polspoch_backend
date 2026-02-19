import csv from "csv-parser";
import fs from "fs";
import { Types } from "mongoose";
import { IProduct } from "./product.interface";
import { Family, Product } from "./product.model";

interface IProductFilters {
  family?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const ProductService = {
  createProduct: async (payload: Partial<IProduct>) => {
    return await Product.create(payload);
  },

  // getAllProducts: async (filters: {
  //   family?: string
  //   search?: string
  //   page?: number
  //   limit?: number
  // }) => {
  //   const { family, search } = filters

  //   const page = filters.page || 1
  //   const limit = filters.limit || 20
  //   const skip = (page - 1) * limit

  //   // Build dynamic query
  //   const query: any = {}

  //   if (family) {
  //     query.family = family
  //   }

  //   if (search) {
  //     query.productName = { $regex: search, $options: 'i' } // case-insensitive regex
  //   }

  //   const products = await Product.find(query)
  //     .skip(skip)
  //     .limit(limit)
  //     .sort({ createdAt: -1 })

  //   const total = await Product.countDocuments(query)

  //   return {
  //     meta: {
  //       page,
  //       limit,
  //       total,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //     data: products,
  //   }
  // },
  getAllProducts: async (filters: IProductFilters) => {
    const { family, search } = filters;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (family) {
      query.family = new Types.ObjectId(family);
    }

    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query)
      .populate("family")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: products,
    };
  },

  getSingleProduct: async (id: string) => {
    return await Product.findById(id).populate("family");
  },

  updateProduct: async (id: string, payload: Partial<IProduct>) => {
    return await Product.findByIdAndUpdate(id, payload, { new: true });
  },

  deleteProduct: async (id: string) => {
    return await Product.findByIdAndDelete(id);
  },

  //! multiple Product Update upload in there.
  multipleProductUpdate: async (file: any) => {
    if (!file) {
      throw new Error("CSV file is required");
    }

    const results: any[] = [];

    // CSV read
    await new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    let successCount = 0;
    const errors: any[] = [];

    for (const row of results) {
      const { productName, reference, miterPerUnitPrice } = row;

      try {
        const product = await Product.findOne({ productName });

        if (!product) {
          errors.push({
            productName,
            reference,
            reason: "Product not found",
          });
          continue;
        }

        const feature = product.features.find(
          (f: any) => f.reference === reference,
        );

        if (!feature) {
          errors.push({
            productName,
            reference,
            reason: "Reference not found in features",
          });
          continue;
        }

        feature.miterPerUnitPrice = Number(miterPerUnitPrice);
        await product.save();

        successCount++;
      } catch (err: any) {
        errors.push({
          productName,
          reference,
          reason: err.message || "Unknown error",
        });
      }
    }

    return {
      totalRows: results.length,
      success: successCount,
      failed: errors.length,
      errors,
    };
  },
};

export const FamilyService = {
  createFamily: async (payload: any) => {
    return await Family.create(payload);
  },

  getAllFamilies: async () => {
    return await Family.find().sort({ createdAt: -1 });
  },

  getSingleFamily: async (id: string) => {
    return await Family.findById(id);
  },

  updateFamily: async (id: string, payload: any) => {
    return await Family.findByIdAndUpdate(id, payload, { new: true });
  },

  deleteFamily: async (id: string) => {
    return await Family.findByIdAndDelete(id);
  },
};
