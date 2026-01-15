import { model, Schema } from 'mongoose'
import { IShippingAddress } from './shippingAddress.interface'

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
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    addressType: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home',
    },
    deliveryInstructions: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
shippingAddressSchema.index({ userId: 1, isDefault: 1 })

// Ensure only one default address per user
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
