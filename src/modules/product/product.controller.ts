import { Request, Response } from 'express'
import { FamilyService, ProductService } from './product.service'
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../../utils/cloudinary'
import sendResponse from '../../utils/sendResponse'
import catchAsync from '../../utils/catchAsync'

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

  getAllProducts: catchAsync(async (req, res) => {
    const { family, search, page, limit } = req.query

    const { data, meta} = await ProductService.getAllProducts({
      family: family as string,
      search: search as string,
      page: Number(page),
      limit: Number(limit),
    })

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Products fetched successfully',
      data,
      meta,
    })
  }),

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

  updateProduct: async (req: Request, res: Response): Promise<void> => {
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


export const FamilyController = {
  createFamily: catchAsync(async (req: Request, res: Response) => {
    const body = req.body
    const file = req.file

    let img = undefined

    if (file) {
      const uploaded = await uploadToCloudinary(file.path, 'families')
      img = {
        url: uploaded.secure_url,
        publickey: uploaded.public_id,
      }
    }

    const result = await FamilyService.createFamily({
      familyName: body.familyName,
      img,
    })

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Family created successfully',
      data: result,
    })
  }),

  getAllFamilies: catchAsync(async (_req, res) => {
    const result = await FamilyService.getAllFamilies()

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Families fetched successfully',
      data: result,
    })
  }),

  getSingleFamily: catchAsync(async (req, res) => {
    const { id } = req.params

    const result = await FamilyService.getSingleFamily(id)

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Family not found',
      })
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    })
  }),

  updateFamily: catchAsync(async (req, res) => {
    const { id } = req.params
    const body = req.body
    const file = req.file

    const existing = await FamilyService.getSingleFamily(id)
    if (!existing) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Family not found',
      })
    }

    let img = existing.img

    if (file) {
      if (img?.publickey) {
        await deleteFromCloudinary(img.publickey)
      }

      const uploaded = await uploadToCloudinary(file.path, 'families')
      img = {
        url: uploaded.secure_url,
        publickey: uploaded.public_id,
      }
    }

    const updated = await FamilyService.updateFamily(id, {
      familyName: body.familyName ?? existing.familyName,
      img,
    })

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Family updated successfully',
      data: updated,
    })
  }),

  deleteFamily: catchAsync(async (req, res) => {
    const { id } = req.params

    const existing = await FamilyService.getSingleFamily(id)
    if (!existing) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: 'Family not found',
      })
    }

    if (existing.img?.publickey) {
      await deleteFromCloudinary(existing.img.publickey)
    }

    await FamilyService.deleteFamily(id)

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Family deleted successfully',
    })
  }),
}