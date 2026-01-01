import { Router } from 'express'
import { FamilyController, ProductController } from './product.controller'
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

router.post('/family', upload.single('img'), FamilyController.createFamily)

router.get('/family', FamilyController.getAllFamilies)
router.get('/family/:id', FamilyController.getSingleFamily)

router.put('/family/:id', upload.single('img'), FamilyController.updateFamily)

router.delete('/family/:id', FamilyController.deleteFamily)

export default router
