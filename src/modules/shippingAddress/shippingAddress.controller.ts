import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import shippingAddressService from './shippingAddress.service'

const createShippingAddress = catchAsync(async (req, res) => {
  const { email } = req.user
  const result = await shippingAddressService.createShippingAddress(
    req.body,
    email
  )

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Shipping address created successfully',
    data: result,
  })
})

const getMyShippingAddresses = catchAsync(async (req, res) => {
  const { email } = req.user
  const result = await shippingAddressService.getMyShippingAddresses(email)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Shipping addresses retrieved successfully',
    data: result,
  })
})

const getShippingAddressById = catchAsync(async (req, res) => {
  const { email } = req.user
  const { addressId } = req.params
  const result = await shippingAddressService.getShippingAddressById(
    addressId,
    email
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Shipping address retrieved successfully',
    data: result,
  })
})

const getDefaultAddress = catchAsync(async (req, res) => {
  const { email } = req.user
  const result = await shippingAddressService.getDefaultAddress(email)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Default shipping address retrieved successfully',
    data: result,
  })
})

const updateShippingAddress = catchAsync(async (req, res) => {
  const { email } = req.user
  const { addressId } = req.params
  const result = await shippingAddressService.updateShippingAddress(
    addressId,
    req.body,
    email
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Shipping address updated successfully',
    data: result,
  })
})

const setDefaultAddress = catchAsync(async (req, res) => {
  const { email } = req.user
  const { addressId } = req.params
  const result = await shippingAddressService.setDefaultAddress(
    addressId,
    email
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Default address set successfully',
    data: result,
  })
})

const deleteShippingAddress = catchAsync(async (req, res) => {
  const { email } = req.user
  const { addressId } = req.params
  await shippingAddressService.deleteShippingAddress(addressId, email)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Shipping address deleted successfully',
    data: null,
  })
})

const getAllShippingAddresses = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const result = await shippingAddressService.getAllShippingAddresses(
    page,
    limit
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'All shipping addresses retrieved successfully',
    data: result.data,
    meta: result.meta,
  })
})

const getAddressesByOrderId = catchAsync(async (req, res) => {
  const { orderId } = req.params
  const result = await shippingAddressService.getAddressesByOrderId(orderId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Shipping addresses for order retrieved successfully',
    data: result,
  })
})

const shippingAddressController = {
  createShippingAddress,
  getMyShippingAddresses,
  getShippingAddressById,
  getDefaultAddress,
  updateShippingAddress,
  setDefaultAddress,
  deleteShippingAddress,
  getAllShippingAddresses,
  getAddressesByOrderId,
}

export default shippingAddressController
