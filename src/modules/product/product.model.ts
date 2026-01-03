import { Schema, model } from 'mongoose'
import { IProduct, IProductFeature } from './product.interface'
import { required } from 'zod/v4-mini'

const ProductFeatureSchema = new Schema<IProductFeature>(
  {
    reference: {
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
    unitSizes: {
      type: [Schema.Types.Mixed], // can be number or string
      default: [],
    },
    kgsPerUnit: {
      type: Schema.Types.Number,
    },
    miterPerUnitPrice: {
      type: Number,
      required: true,
    },
  }
  // { _id: false } // prevents auto _id in each feature object
)

const FamilySchema = new Schema(
  {
    familyName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    img: {
      url: { type: String },
      publickey: { type: String },
    },
  },
  { timestamps: true, versionKey: false }
)

export const Family = model('Family', FamilySchema)

const ProductSchema = new Schema<IProduct>(
  {
    family: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    // features is an array of objects
    features: {
      type: [ProductFeatureSchema],
      default: [],
    },

    unitSizeCustomizationNote: {
      type: String,
      default: null,
    },

    minRange: { type: Number, default: null },
    maxRange: { type: Number, default: null },

    measureUnit: {
      type: String,
      required: true,
      trim: true,
    },

    availabilityNote: {
      type: String,
      default: null,
    },
    productImage: [
      {
        url: String,
        publickey: String,
      },
    ],
  },
  { timestamps: true, versionKey: false }
)

export const Product = model<IProduct>('Product', ProductSchema)
// test