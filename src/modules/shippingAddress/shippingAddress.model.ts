import { model, Schema } from 'mongoose'
import { IShippingAddress } from './shippingAddress.interface'

/**
 * Invoice Details Sub Schema
 */
const invoiceDetailsSchema = new Schema(
  {
    name: {
      type: String,
      
      trim: true,
    },
    email: {
      type: String,
      
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    vat: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      
      trim: true,
    },
    city: {
      type: String,
      
      trim: true,
    },
    province: {
      type: String,
      
      trim: true,
    },
    postalCode: {
      type: String,
     
      trim: true,
    },
    country: {
      type: String,
     
      trim: true,
    },
  },
  { _id: false } // embedded doc, no separate _id
)

/**
 * Shipping Address Schema
 */
const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },

    // Shipping contact
    fullName: {
      type: String,
     
      trim: true,
    },
    email: {
      type: String,
     
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },

    // Address
    street: {
      type: String,
      
      trim: true,
    },
    city: {
      type: String,
     
      trim: true,
    },
    province: {
      type: String,
      
      trim: true,
    },
    postalCode: {
      type: String,
     
      trim: true,
    },
    country: {
      type: String,
      
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },

    // Extra info
    shippingComment: {
      type: String,
      trim: true,
    },
    deliveryInstructions: {
      type: String,
      trim: true,
    },

    // Invoice
    invoiceDetails: {
      type: invoiceDetailsSchema,
    },

    // Meta
    isDefault: {
      type: Boolean,
      default: false,
    },
    addressType: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home',
    },
  },
  {
    timestamps: true,
  }
)

/**
 * Indexes
 */
shippingAddressSchema.index({ userId: 1, isDefault: 1 })

/**
 * Ensure only one default address per user
 */
shippingAddressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await ShippingAddress.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    )
  }
  next()
})

export const ShippingAddress = model<IShippingAddress>(
  'ShippingAddress',
  shippingAddressSchema
)
