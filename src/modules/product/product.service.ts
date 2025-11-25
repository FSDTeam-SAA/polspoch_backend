import { Product } from './product.model'
import { IProduct } from './product.interface'

export const ProductService = {
  createProduct: async (payload: Partial<IProduct>) => {
    return await Product.create(payload)
  },

  getAllProducts: async () => {
    return await Product.find().sort({ createdAt: -1 })
  },

  getSingleProduct: async (id: string) => {
    return await Product.findById(id)
  },

  updateProduct: async (id: string, payload: Partial<IProduct>) => {
    return await Product.findByIdAndUpdate(id, payload, { new: true })
  },

  deleteProduct: async (id: string) => {
    return await Product.findByIdAndDelete(id)
  },
}
