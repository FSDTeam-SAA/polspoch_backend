import { Router } from 'express'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { USER_ROLE } from '../user/user.constant'
import shippingAddressController from './shippingAddress.controller'
import { shippingAddressValidation } from './shippingAddress.validation'

const router = Router()

// User routes
router.post(
  '/create',
  auth(USER_ROLE.USER),
  validateRequest(shippingAddressValidation.createShippingAddressValidation),
  shippingAddressController.createShippingAddress
)

router.get(
  '/my-addresses',
  auth(USER_ROLE.USER),
  shippingAddressController.getMyShippingAddresses
)

router.get(
  '/default',
  auth(USER_ROLE.USER),
  shippingAddressController.getDefaultAddress
)

router.get(
  '/:addressId',
  auth(USER_ROLE.USER),
  shippingAddressController.getShippingAddressById
)

router.put(
  '/:addressId',
  auth(USER_ROLE.USER),
  validateRequest(shippingAddressValidation.updateShippingAddressValidation),
  shippingAddressController.updateShippingAddress
)

router.patch(
  '/set-default/:addressId',
  auth(USER_ROLE.USER),
  shippingAddressController.setDefaultAddress
)

router.delete(
  '/:addressId',
  auth(USER_ROLE.USER),
  shippingAddressController.deleteShippingAddress
)

// Admin routes
router.get(
  '/admin/all',
  auth(USER_ROLE.ADMIN),
  shippingAddressController.getAllShippingAddresses
)

router.get(
  '/admin/order/:orderId',
  auth(USER_ROLE.ADMIN),
  shippingAddressController.getAddressesByOrderId
)

const shippingAddressRouter = router
export default shippingAddressRouter
