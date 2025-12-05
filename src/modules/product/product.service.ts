import { Product } from './product.model'
import { IProduct } from './product.interface'

export const ProductService = {
  createProduct: async (payload: Partial<IProduct>) => {
    return await Product.create(payload)
  },

  getAllProducts: async (filters: {
    family?: string
    search?: string
    page?: number
    limit?: number
  }) => {
    const { family, search } = filters

    const page = filters.page || 1
    const limit = filters.limit || 20
    const skip = (page - 1) * limit

    // Build dynamic query
    const query: any = {}

    if (family) {
      query.family = family
    }

    if (search) {
      query.productName = { $regex: search, $options: 'i' } // case-insensitive regex
    }

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Product.countDocuments(query)

    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: products,
    }
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
