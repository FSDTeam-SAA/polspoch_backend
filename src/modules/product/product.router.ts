import { Router } from 'express'
import { ProductController } from './product.controller'
import { upload } from '../../middleware/multer.middleware'

const router = Router()

router.post(
  '/add-product',
  upload.array('productImage', 10),
  ProductController.createProduct
)

router.get('/', ProductController.getAllProducts)
router.get('/:id', ProductController.getSingleProduct)

router.put(
  '/update/:id',
  upload.array('productImage', 10),
  ProductController.updateProduct
)

router.delete('/:id', ProductController.deleteProduct)

export default router
