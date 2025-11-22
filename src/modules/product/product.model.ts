import { Schema, model } from 'mongoose'
import { IProduct } from './product.interface'

const ProductSchema = new Schema<IProduct>(
  {
    reference: {
      type: String,
      required: true,
      trim: true,
    },
    family: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    size1: { type: Number, default: null },
    size2: { type: Number, default: null },
    thickness: { type: Number, default: null },

    finishQuality: {
      type: String,
      required: true,
      trim: true,
    },

    // All UNIT SIZE, 1000, 2000, 2500, "CUSTOMIZED" → Converted into an array
    unitSizes: {
      type: [Schema.Types.Mixed], // numbers + string values
      default: [],
    },
    unitSizeCustomizationNote: {
      type: String,
    },

    customizedMinRange: { type: Number, default: null },

    measureUnit: {
      type: String,
      required: true,
      trim: true,
    },

    kgsPerUnit: {
      type: Number,
      required: true,
    },

    pricePerUnit: {
      type: Number,
      required: true,
    },

    availabilityNote: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
)

export const Product = model<IProduct>('Product', ProductSchema)
