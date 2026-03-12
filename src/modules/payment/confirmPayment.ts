import cron from 'node-cron'
import Stripe from 'stripe'
import Payment from './payment.model'
import { User } from '../user/user.model'
import { Order } from '../order/order.model'
import sendEmail from '../../utils/sendEmail'
import config from '../../config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil',
})

const processPaymentSuccess = async (payment: any) => {
  const paymentIntentId =
    typeof payment.payment_intent === 'string'
      ? payment.payment_intent
      : payment.payment_intent?.id

  const paymentDoc = await Payment.findById(payment._id)
  if (!paymentDoc) return

  paymentDoc.status = 'success'
  paymentDoc.transactionId = paymentIntentId
  await paymentDoc.save()

  console.log(`✅ Payment ${paymentDoc._id} marked as success`)

  const user = await User.findById(paymentDoc.userId)
  const order = await Order.findByIdAndUpdate(
    paymentDoc.orderId,
    { paymentStatus: 'paid' },
    { new: true },
  )

  if (!user || !order) {
    console.warn(`⚠️ User or Order not found for payment ${paymentDoc._id}`)
    return
  }

  await sendUserPurchaseEmail(user, paymentDoc, order)
  await sendAdminPurchaseEmail(user, paymentDoc, order)
}

const sendUserPurchaseEmail = async (user: any, payment: any, order: any) => {
  const userHtml = `
    <h2>Purchase Confirmation</h2>
    <p>Hi ${user.firstName || 'Customer'},</p>
    <p>We have received your payment of <strong>€${payment.amount.toFixed(
      2,
    )}</strong> for Order ID: <strong>${order._id}</strong>.</p>
    <p>Your purchase is now confirmed.</p>
    <p>Thank you for your order.</p>
  `

  const userEmailRes = await sendEmail({
    to: user.email,
    subject: 'Purchase Confirmation ✅',
    html: userHtml,
  })

  if (!userEmailRes.success) {
    console.error(
      `❌ Failed to send email to user ${user.email}:`,
      userEmailRes.error,
    )
  }
}

const sendAdminPurchaseEmail = async (user: any, payment: any, order: any) => {
  if (!config.email.adminEmail) {
    console.warn(`⚠️ Admin email not configured`)
    return
  }

  const adminHtml = `
    <h2>New Purchase Paid</h2>
    <p>User: ${user.firstName || user.email}</p>
    <p>Email: ${user.email}</p>
    <p>Amount: <strong>€${payment.amount.toFixed(2)}</strong></p>
    <p>Order ID: <strong>${order._id}</strong></p>
    <p>Payment ID: <strong>${payment._id}</strong></p>
  `

  const adminEmailRes = await sendEmail({
    to: config.email.adminEmail,
    subject: 'New Purchase Paid',
    html: adminHtml,
  })

  if (!adminEmailRes.success) {
    console.error(`❌ Failed to send email to admin:`, adminEmailRes.error)
  }
}

const checkStripePaymentStatus = async (payment: any) => {
  if (!payment.checkoutSessionId) return

  try {
    const session = await stripe.checkout.sessions.retrieve(
      payment.checkoutSessionId,
      {
        expand: ['payment_intent'],
      },
    )

    if (session.payment_status === 'paid') {
      await processPaymentSuccess(session)
    }
  } catch (err) {
    console.error(`⚠️ Failed to check payment ${payment._id}:`, err)
  }
}

export const startStripePendingPaymentsJob = () => {
  cron.schedule('*/2 * * * *', async () => {
    console.log('✅ Running Stripe pending payments check...')

    try {
      const pendingPayments = await Payment.find({
        status: 'pending',
        checkoutSessionId: { $exists: true },
      })

      for (const payment of pendingPayments) {
        await checkStripePaymentStatus(payment)
      }

      console.log(
        `✅ Completed check for ${pendingPayments.length} pending payments`,
      )
    } catch (err) {
      console.error('⚠️ Cron job failed:', err)
    }
  })
}
