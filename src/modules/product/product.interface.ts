import { ObjectId } from 'mongoose'

export interface IProductFeature {
  reference: string
  size1?: number | null
  size2?: number | null
  thickness?: number | null
  finishQuality: string
  unitSizes: (number | string)[]
  kgsPerUnit: number
  miterPerUnitPrice: number
}

interface IProductImage {
  url: string
  publickey: string
}

export interface IProduct {
  family: ObjectId
  productName: string

  features: IProductFeature[]

  unitSizeCustomizationNote?: string | null

  minRange?: number | null
  maxRange?: number | null

  measureUnit: string

  availabilityNote?: string | null

  productImage: IProductImage[]

  createdAt?: Date
  updatedAt?: Date
}
