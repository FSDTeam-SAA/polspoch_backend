import { model, Schema } from "mongoose";
import { IProduct } from "./product.interface";

const ProductSchema = new Schema<IProduct>(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    longestSide: {
      type: [Number],
      default: [],
    },
    shortestSide: {
      type: [Number],
      default: [],
    },
    thickness: {
      type: [Number],
      default: [],
    },
    long: {
      type: [Number],
      default: [],
    },
    finish: {
      type: [String],
      default: [],
    },
    quality: {
      type: [String],
      default: [],
    },
    manufacturingProcess: {
      type: String,
      trim: true,
    },
    productInfo: [
      {
        title: { type: String, trim: true },
        description: { type: String },
      },
    ],
    technicalInfo: [
      {
        title: { type: String, trim: true },
        description: { type: String },
      },
    ],
    inStock: {
      type: Boolean,
      default: true,
    },
    image: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const Product = model<IProduct>("Product", ProductSchema);
