import { Types } from 'mongoose'

export interface IInvoiceDetails {
  name: string
  email: string
  phone: string
  company?: string
  vat?: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface IShippingAddress {
  _id?: string
  userId: Types.ObjectId
  orderId?: Types.ObjectId

  // Shipping contact
  fullName: string
  email: string
  phone: string
  company?: string

  // Address
  street: string
  city: string
  province: string
  postalCode: string
  country: string
  landmark?: string

  // Extra shipping info
  shippingComment?: string
  deliveryInstructions?: string

  // Invoice
  invoiceDetails?: IInvoiceDetails

  // Meta
  isDefault?: boolean
  addressType?: 'home' | 'office' | 'other'
  createdAt?: Date
  updatedAt?: Date
}
