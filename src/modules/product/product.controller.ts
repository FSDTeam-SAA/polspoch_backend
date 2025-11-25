import { Request, Response } from 'express'
import { ProductService } from './product.service'
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';

export const ProductController = {
  createProduct: async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[]
      const body = req.body

      const uploadedImages: { url: string; publickey: string }[] = []

      if (files && files.length > 0) {
        for (const file of files) {
          const uploaded = await uploadToCloudinary(file.path, 'products')
          uploadedImages.push({
            url: uploaded.secure_url,
            publickey: uploaded.public_id,
          })
        }
      }

      const data = {
        ...body,
        features: JSON.parse(body.features || '[]'),
        productImage: uploadedImages,
      }

      const result = await ProductService.createProduct(data)

      res.json({
        success: true,
        message: 'Product added successfully',
        data: result,
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  getAllProducts: async (req: Request, res: Response) => {
    try {
      const products = await ProductService.getAllProducts()
      res.json({ success: true, data: products })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  getSingleProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const product = await ProductService.getSingleProduct(id)

      if (!product) {
         res.status(404).json({ success: false, message: 'Not found' })
         return
      }

      res.json({ success: true, data: product })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  updateProduct: async (req: Request, res: Response):  Promise<void> => {
    try {
      const { id } = req.params
      const body = req.body
      const files = req.files as Express.Multer.File[]

      const existing = await ProductService.getSingleProduct(id)
      if (!existing) {
         res.status(404).json({ success: false, message: 'Not found' })
         return
      }

      let newImages = existing.productImage

      // Handle new uploads
      if (files && files.length > 0) {
        for (const file of files) {
          const uploaded = await uploadToCloudinary(file.path, 'products')
          newImages.push({
            url: uploaded.secure_url,
            publickey: uploaded.public_id,
          })
        }
      }

      // If client sends "deleteImages" array
      if (body.deleteImages) {
        const deleteArr: string[] = JSON.parse(body.deleteImages)

        for (const pid of deleteArr) {
          await deleteFromCloudinary(pid)
        }

        newImages = newImages.filter(
          (img) => !deleteArr.includes(img.publickey)
        )
      }

      const payload = {
        ...body,
        features: JSON.parse(body.features || '[]'),
        productImage: newImages,
      }

      const updated = await ProductService.updateProduct(id, payload)

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  },

  deleteProduct: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      const product = await ProductService.getSingleProduct(id)
      if (!product) {
         res.status(404).json({ success: false, message: 'Not found' })
         return
      }

      // Delete images from cloudinary
      for (const img of product.productImage) {
        await deleteFromCloudinary(img.publickey)
      }

      await ProductService.deleteProduct(id)

      res.json({
        success: true,
        message: 'Product deleted successfully',
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  },
}
