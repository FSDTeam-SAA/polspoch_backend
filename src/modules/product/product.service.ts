import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '../../utils/cloudinary'
import Order from '../order/order.model'
import { Product } from './product.model'
import { IProduct } from './product.interface'

// ============================
// 📌 ADD PRODUCT
// ============================
const addNewProduct = async (
  payload: IProduct,
  files: Express.Multer.File[]
) => {
  let images: { public_id: string; url: string }[] = []

  // Upload new images
  if (files.length > 0) {
    const uploadResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.path, 'products'))
    )

    images = uploadResults.map((uploaded: any) => ({
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    }))
  }

  // Create product
  const product = await Product.create({
    ...payload,
    images,
  })

  return product
}

// ============================
// 📌 GET PRODUCTS (Pagination + Search + Sort + Filter)
// ============================
const getAllProducts = async (query: any) => {
  const { page = 1, limit = 10, search, sort = '-createdAt', category } = query

  const filter: any = {}

  if (search) {
    filter.productName = { $regex: search, $options: 'i' }
  }

  if (category) {
    filter.category = category
  }

  const skip = (Number(page) - 1) * Number(limit)

  const products = await Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))

  const total = await Product.countDocuments(filter)

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
    data: products,
  }
}

// ============================
// 📌 GET SINGLE PRODUCT
// ============================
const getSingeProduct = async (productId: string) => {
  const product = await Product.findById(productId)

  if (!product) throw new AppError('Product not found', StatusCodes.NOT_FOUND)

  return product
}

// ============================
// 📌 UPDATE PRODUCT
// ============================
const updateProduct = async (
  payload: IProduct & { deleteImages?: string[] },
  productId: string,
  files: Express.Multer.File[]
) => {
  const product = await Product.findById(productId)

  if (!product) throw new AppError('Product not found', StatusCodes.NOT_FOUND)

  let updatedImages = [...product.images]

  // // Handle image deletion (if client sends list of public_ids to remove)
  
  if (payload.deleteImages?.length) {
    updatedImages = updatedImages.filter(
      (img) => !payload.deleteImages?.includes(img.public_id)
    )

    await Promise.all(
      payload.deleteImages.map((public_id) => deleteFromCloudinary(public_id))
    )
  }

  // Handle new image uploads
  if (files.length > 0) {
    const uploadResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.path, 'products'))
    )

    const newImages = uploadResults.map((uploaded: any) => ({
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    }))

    updatedImages.push(...newImages)
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      ...payload,
      images: updatedImages,
    },
    { new: true }
  )

  return updatedProduct
}

// ============================
// 📌 DELETE PRODUCT (Block If Has Orders)
// ============================
const deleteProduct = async (productId: string) => {
  const product = await Product.findById(productId)

  if (!product) throw new AppError('Product not found', StatusCodes.NOT_FOUND)

  const hasOrders = await Order.findOne({ 'items.productId': productId })

  if (hasOrders) {
    throw new AppError(
      'Cannot delete product because it is linked to existing orders.',
      StatusCodes.CONFLICT
    )
  }

  // Delete images from cloudinary
  await Promise.all(
    product.images.map((img) => deleteFromCloudinary(img.public_id))
  )

  // Delete product
  await Product.findByIdAndDelete(productId)

  return true
}

const productService = {
  addNewProduct,
  getAllProducts,
  getSingeProduct,
  updateProduct,
  deleteProduct,
}

export default productService
