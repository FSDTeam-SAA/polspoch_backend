import { Types } from 'mongoose'

export interface IShippingAddress {
  _id?: string
  userId: Types.ObjectId
  orderId?: Types.ObjectId
  fullName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  landmark?: string
  isDefault?: boolean
  addressType?: 'home' | 'office' | 'other'
  deliveryInstructions?: string
  createdAt?: Date
  updatedAt?: Date
}
