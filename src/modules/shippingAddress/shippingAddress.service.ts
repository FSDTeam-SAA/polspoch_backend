import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { IShippingAddress } from './shippingAddress.interface'
import { ShippingAddress } from './shippingAddress.model'

const createShippingAddress = async (
  payload: IShippingAddress,
  email: string
) => {
  const user = await User.isUserExistByEmail(email)
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND)
  }

  payload.userId = user._id

  // If this is marked as default, unset other default addresses
  if (payload.isDefault) {
    await ShippingAddress.updateMany(
      { userId: user._id },
      { $set: { isDefault: false } }
    )
  }

  const result = await ShippingAddress.create(payload)
  return result
}

const getMyShippingAddresses = async (email: string) => {
  const user = await User.isUserExistByEmail(email)
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND)
  }

  const result = await ShippingAddress.find({ userId: user._id })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean()

  return result
}

const getShippingAddressById = async (addressId: string, email: string) => {
  const user = await User.isUserExistByEmail(email)
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND)
  }

  const result = await ShippingAddress.findOne({
    _id: addressId,
    userId: user._id,
  }).lean()

  if (!result) {
    throw new AppError('Shipping address not found', StatusCodes.NOT_FOUND)
  }

  return result
}

const getDefaultAddress = async (email: string) => {
  const user = await User.isUserExistByEmail(email)
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND)
  }

  const result = await ShippingAddress.findOne({
    userId: user._id,
    isDefault: true,
  }).lean()

  return result
}

const updateShippingAddress = async (
  addressId: string,
  payload: Partial<IShippingAddress>,
  email: string
) => {
  const user = await User.isUserExistByEmail(email)
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND)
  }

  const existingAddress = await ShippingAddress.findOne({
    _id: addressId,
    userId: user._id,
  })

  if (!existingAddress) {
    throw new AppError('Shipping address not found', StatusCodes.NOT_FOUND)
  }

  // If updating to default, unset other default addresses
  if (payload.isDefault) {
    await ShippingAddress.updateMany(
      { userId: user._id, _id: { $ne: addressId } },
      { $set: { isDefault: false } }
    )
  }

  const result = await ShippingAddress.findByIdAndUpdate(
    addressId,
    { $set: payload },
    { new: true, runValidators: true }
  )

  return result
}

const setDefaultAddress = async (addressId: string, email: string) => {
  const user = await User.isUserExistByEmail(email)
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND)
  }

  const existingAddress = await ShippingAddress.findOne({
    _id: addressId,
    userId: user._id,
  })

  if (!existingAddress) {
    throw new AppError('Shipping address not found', StatusCodes.NOT_FOUND)
  }

  // Unset all default addresses for this user
  await ShippingAddress.updateMany(
    { userId: user._id },
    { $set: { isDefault: false } }
  )

  // Set this address as default
  const result = await ShippingAddress.findByIdAndUpdate(
    addressId,
    { $set: { isDefault: true } },
    { new: true }
  )

  return result
}

const deleteShippingAddress = async (addressId: string, email: string) => {
  const user = await User.isUserExistByEmail(email)
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND)
  }

  const existingAddress = await ShippingAddress.findOne({
    _id: addressId,
    userId: user._id,
  })

  if (!existingAddress) {
    throw new AppError('Shipping address not found', StatusCodes.NOT_FOUND)
  }

  const result = await ShippingAddress.findByIdAndDelete(addressId)
  return result
}

const getAllShippingAddresses = async (page: number, limit: number) => {
  const skip = (page - 1) * limit

  const result = await ShippingAddress.find()
    .populate('userId', 'firstName lastName email')
    .populate('orderId', 'type status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  const total = await ShippingAddress.countDocuments()

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const getAddressesByOrderId = async (orderId: string) => {
  const result = await ShippingAddress.find({ orderId })
    .populate('userId', 'firstName lastName email')
    .lean()

  return result
}

const shippingAddressService = {
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

export default shippingAddressService
