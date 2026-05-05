import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import Cart from '../cart/cart.model'
import { IProductFeature } from '../product/product.interface'
import { Product } from '../product/product.model'
import Service from '../service/service.model'
import { User } from '../user/user.model'
import { ShippingPolicy } from '../shippingPolicy/shipping.model'
import config from '../../config'
import sendEmail from '../../utils/sendEmail'
import { IOrder } from './order.interface'
import { Order } from './order.model'

/**
 * Validates that the order total is reasonable and doesn't have duplicate shipping
 * This prevents the double-shipping bug
 */
const validateOrderTotal = async (payload: IOrder, email: string) => {
  // Only validate cart orders (where duplicate shipping could occur)
  if (payload.type !== 'cart' || !payload.cartItems) {
    return true
  }

  let calculatedTotal = 0
  let totalWeight = 0
  let maxDimension = 0

  // Recalculate total based on cart items
  for (const item of payload.cartItems) {
    const cartItem = await Cart.findById(item.cartId).lean()
    if (!cartItem) continue

    // For both products and services, use stored totalAmount
    // (which represents product price without shipping)
    calculatedTotal += cartItem.totalAmount || 0

    // Track dimensions for shipping calculation
    if (cartItem.type === 'service') {
      totalWeight += cartItem.serviceData?.totalWeight || 0
      maxDimension = Math.max(maxDimension, cartItem.serviceData?.maxDimensionDetected || 0)
    }
  }

  // Calculate shipping ONCE
  let shippingCost = 0
  if (maxDimension > 0 && totalWeight > 0) {
    const [courier, truck] = await Promise.all([
      ShippingPolicy.findOne({ methodName: 'courier' }),
      ShippingPolicy.findOne({ methodName: 'truck' }),
    ])

    if (courier && truck) {
      if (maxDimension <= courier.maxSizeAllowed) {
        let cost = courier.basePrice
        if (totalWeight > courier.freeWeightLimit) {
          cost += (totalWeight - courier.freeWeightLimit) * courier.extraWeightPrice
        }
        if (maxDimension >= courier.sizeThreshold) {
          cost += courier.sizeSurcharge
        }
        shippingCost = Math.min(cost, courier.maxTotalCost)
      } else {
        shippingCost = truck.basePrice
      }
    }
  }

  const expectedTotal = calculatedTotal + shippingCost

  // Allow 5% variance for rounding differences
  const tolerance = expectedTotal * 0.05
  const difference = Math.abs(expectedTotal - (payload.totalAmount || 0))

  if (difference > tolerance) {
    console.warn(
      `⚠️ SHIPPING BUG DETECTED: Expected €${expectedTotal.toFixed(2)}, Got €${(payload.totalAmount || 0).toFixed(2)}`
    )
    throw new AppError(
      `Order total mismatch. Expected €${expectedTotal.toFixed(2)}, received €${(payload.totalAmount || 0).toFixed(2)}. This may indicate a double-shipping error.`,
      StatusCodes.BAD_REQUEST,
    )
  }

  return true
}

const createNewOrder = async (payload: IOrder, email: string) => {
  const user = await User.isUserExistByEmail(email)
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND)
  }

  // SECURITY: Validate order total to prevent double-shipping fraud
  await validateOrderTotal(payload, email)

  if (payload.type === 'product') {
    if (!payload.product?.productId) {
      throw new AppError('Product info is required', StatusCodes.BAD_REQUEST)
    }

    const product = await Product.findById(payload.product.productId).lean()
    if (!product) {
      throw new AppError('Product not found', StatusCodes.NOT_FOUND)
    }

    let featureData: IProductFeature
    if (payload.product.featuredId) {
      featureData = product.features.find(
        (f) =>
          (f as any)._id.toString() === payload.product.featuredId?.toString(),
      ) as IProductFeature
      if (!featureData) {
        throw new AppError('Selected feature not found', StatusCodes.NOT_FOUND)
      }
    } else {
      featureData = product.features[0]
    }

    if (payload.product.unitSize && payload.product.range) {
      throw new AppError(
        'You can select either unitSize or range, not both.',
        StatusCodes.BAD_REQUEST,
      )
    }
    if (!payload.product.unitSize && !payload.product.range) {
      throw new AppError(
        'You must select either unitSize or range.',
        StatusCodes.BAD_REQUEST,
      )
    }

    const quantity = payload.quantity || 1
    if (
      (featureData.minRange && quantity < featureData.minRange) ||
      (featureData.maxRange && quantity > featureData.maxRange)
    ) {
      throw new AppError(
        `Quantity must be between ${featureData.minRange} and ${featureData.maxRange}`,
        StatusCodes.BAD_REQUEST,
      )
    }
  }

  if (payload.type === 'service') {
    if (!payload.serviceId) {
      throw new AppError('ServiceId is required', StatusCodes.BAD_REQUEST)
    }
    const service = await Service.findById(payload.serviceId).lean()
    if (!service) {
      throw new AppError('Service not found', StatusCodes.NOT_FOUND)
    }
  }

  // ৭. Cart order
  if (payload.type === 'cart') {
    if (!payload.cartItems || payload.cartItems.length === 0) {
      throw new AppError('Cart is empty', StatusCodes.BAD_REQUEST)
    }

    for (const item of payload.cartItems) {
      const cartItem = await Cart.findById(item.cartId).lean()
      if (!cartItem) {
        throw new AppError(
          `Cart item ${item.cartId} not found`,
          StatusCodes.NOT_FOUND,
        )
      }
    }
  }

  // ৮. Order create
  const newOrder = await Order.create({
    userId: user._id,
    product: payload.product,
    serviceId: payload.serviceId,
    cartItems: payload.cartItems,
    type: payload.type,
    quantity: payload.quantity,
    totalAmount: payload.totalAmount,
    status: 'pending',
    paymentStatus: 'unpaid',
    purchaseDate: new Date(),
  })

  return newOrder
}

const getMyOrders = async (email: string, page: number, limit: number) => {
  const user = await User.isUserExistByEmail(email)
  if (!user) throw new AppError('User not found', 404)

  const skip = (page - 1) * limit

  const [orders, totalOrders] = await Promise.all([
    Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userId',
        select: 'firstName lastName email companyName',
      })
      .populate({
        path: 'product.productId',
        model: 'Product',
      })
      .populate({
        path: 'serviceId',
        model: 'Service',
      })
      .populate({
        path: 'cartItems.cartId',
        model: 'Cart',
        populate: [
          { path: 'serviceId', model: 'Service' },
          { path: 'product.productId', model: 'Product' },
        ],
      })
      .lean(),

    Order.countDocuments({ userId: user._id }),
  ])

  /*
  ─────────────────────────────────────────────
      FORMAT ORDER + FEATURE LOGIC
  ─────────────────────────────────────────────
  */

  const formattedOrders = orders.map((order: any) => {
    /*
    --------------------------------
      DIRECT PRODUCT ORDER
    --------------------------------
    */
    if (order.product?.productId) {
      const productDoc = order.product.productId
      const featuredId = order.product.featuredId

      if (productDoc?.features?.length) {
        const matchedFeature = productDoc.features.find(
          (f: any) => f._id.toString() === featuredId?.toString(),
        )

        order.product.selectedFeature = matchedFeature || null
        delete order.product.productId.features
      }
    }

    /*
    --------------------------------
      CART ORDER
    --------------------------------
    */
    if (order.type === 'cart' && order.cartItems?.length > 0) {
      order.cartItems = order.cartItems.map((item: any) => {
        const cartItem = item.cartId
        if (!cartItem) return item

        // SERVICE INSIDE CART
        if (cartItem.type === 'service' && cartItem.serviceId) {
          cartItem.service = cartItem.serviceId
          delete cartItem.serviceId
        }

        // PRODUCT INSIDE CART
        if (cartItem.type === 'product' && cartItem.product) {
          const productDoc = cartItem.product.productId
          const featuredId = cartItem.product.featuredId

          if (productDoc?.features?.length) {
            const matchedFeature = productDoc.features.find(
              (f: any) => f._id.toString() === featuredId?.toString(),
            )

            cartItem.product.selectedFeature = matchedFeature || null
            delete cartItem.product.productId.features
          }
        }

        return { cartId: cartItem }
      })
    }

    return order
  })

  /*
  ─────────────────────────────────────────────
      FINAL RESPONSE
  ─────────────────────────────────────────────
  */

  return {
    data: formattedOrders,
    meta: {
      total: totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    },
  }
}

const getAllOrders = async (
  page: number,
  limit: number,
  search?: string,
  status?: string,
  paymentStatus?: string,
  sortBy?: 'paid' | 'unpaid',
) => {
  const skip = (page - 1) * limit

  const query: any = {}

  if (status && ['pending', 'delivered', 'rejected'].includes(status)) {
    query.status = status
  }

  if (paymentStatus && ['paid', 'unpaid'].includes(paymentStatus)) {
    query.paymentStatus = paymentStatus
  }

  if (search) {
    const users = await User.find({
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ],
    }).select('_id')

    const userIds = users.map((u) => u._id)
    query.userId = { $in: userIds }
  }

  const sortOptions: any = {}
  if (sortBy === 'paid') sortOptions.paymentStatus = 1
  else if (sortBy === 'unpaid') sortOptions.paymentStatus = -1
  else sortOptions.createdAt = -1

  const [orders, totalOrders] = await Promise.all([
    Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userId',
        select: 'firstName lastName email companyName',
      })
      .populate({ path: 'product.productId', model: 'Product' })
      .populate({ path: 'serviceId', model: 'Service' })
      .populate({
        path: 'cartItems.cartId',
        model: 'Cart',
        populate: [
          { path: 'serviceId', model: 'Service' },
          { path: 'product.productId', model: 'Product' },
        ],
      })
      .lean(),

    Order.countDocuments(query),
  ])

  const formattedOrders = orders.map((order: any) => {
    if (order.product?.productId) {
      const productDoc = order.product.productId
      const featuredId = order.product.featuredId

      if (productDoc?.features?.length) {
        const matchedFeature = productDoc.features.find(
          (f: any) => f._id.toString() === featuredId?.toString(),
        )

        order.product.selectedFeature = matchedFeature || null
        delete order.product.productId.features
      }
    }

    // Cart orders
    if (order.type === 'cart' && order.cartItems?.length > 0) {
      order.cartItems = order.cartItems.map((item: any) => {
        const cartItem = item.cartId
        if (!cartItem) return item

        // Service inside cart
        if (cartItem.type === 'service' && cartItem.serviceId) {
          cartItem.service = cartItem.serviceId
          delete cartItem.serviceId
        }

        // Product inside cart
        if (cartItem.type === 'product' && cartItem.product) {
          const productDoc = cartItem.product.productId
          const featuredId = cartItem.product.featuredId

          if (productDoc?.features?.length) {
            const matchedFeature = productDoc.features.find(
              (f: any) => f._id.toString() === featuredId?.toString(),
            )

            cartItem.product.selectedFeature = matchedFeature || null
            delete cartItem.product.productId.features
          }
        }

        return { cartId: cartItem }
      })
    }

    return order
  })

  return {
    success: true,
    message: 'Orders retrieved successfully',
    statusCode: 200,
    data: formattedOrders,
    meta: {
      total: totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    },
  }
}

const updateOrderStatus = async (orderId: string, status: string) => {
  const allowedStatuses = ['pending', 'delivered', 'rejected']
  if (!allowedStatuses.includes(status)) {
    throw new AppError('Invalid status', StatusCodes.BAD_REQUEST)
  }

  const order = await Order.findById(orderId)
  if (!order) {
    throw new AppError('Order not found', StatusCodes.NOT_FOUND)
  }

  if (order.paymentStatus !== 'paid') {
    throw new AppError(
      'Cannot update status of unpaid order',
      StatusCodes.BAD_REQUEST,
    )
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true },
  )

  if (status === 'delivered' && config.email.adminEmail) {
    const user = await User.findById(order.userId).select('firstName email')

    const adminHtml = `
      <h2>Order Completed</h2>
      <p>Order ID: <strong>${order._id}</strong></p>
      <p>Customer: ${user?.firstName || user?.email || 'Unknown'}</p>
      <p>Customer Email: ${user?.email || 'N/A'}</p>
      <p>Status: <strong>${status}</strong></p>
    `

    await sendEmail({
      to: config.email.adminEmail,
      subject: 'Order Completed ✅',
      html: adminHtml,
    })
  }

  return updatedOrder
}

const orderService = {
  createNewOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
}

export default orderService
