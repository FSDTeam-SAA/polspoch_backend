export interface IProduct {
  reference: string
  family: string
  productName: string
  images: {
    public_id: string
    url: string
  }[]
  size1?: number | null
  size2?: number | null
  thickness?: number | null

  finishQuality: string

  unitSizes: (number | string)[]
  unitSizeCustomizationNote: string
  customizedMinRange?: number | null
  measureUnit: string
  kgsPerUnit: number
  pricePerUnit: number

  availabilityNote?: string | null
}
