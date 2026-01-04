import cron from "node-cron";
import Stripe from "stripe";
import Payment from "./payment.model";
import { User } from "../user/user.model";
import { Order } from "../order/order.model";
import sendEmail from "../../utils/sendEmail";
import config from "../../config";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

cron.schedule("*/2 * * * *", async () => {
  console.log("✅ Running Stripe pending payments check...");

  try {
    const pendingPayments = await Payment.find({
      status: "pending",
      checkoutSessionId: { $exists: true },
    });

    for (const payment of pendingPayments) {
      try {
        if (!payment.checkoutSessionId) continue;

        const session = await stripe.checkout.sessions.retrieve(payment.checkoutSessionId, {
          expand: ["payment_intent"],
        });

        if (session.payment_status === "paid") {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id;

          payment.status = "success";
          payment.transactionId = paymentIntentId;
          await payment.save();

          console.log(`✅ Payment ${payment._id} marked as success`);

          // ---------------------------
          // Send Email to User & Admin
          // ---------------------------

          // 1️⃣ Fetch user and order
          const user = await User.findById(payment.userId);
          const order = await Order.findById(payment.orderId);

          if (!user || !order) {
            console.warn(`⚠️ User or Order not found for payment ${payment._id}`);
            continue;
          }

          // 2️⃣ Prepare email content
          const userHtml = `
            <h2>Payment Successful</h2>
            <p>Hi ${user.firstName || "Customer"},</p>
            <p>We have received your payment of <strong>$${payment.amount.toFixed(
              2
            )}</strong> for Order ID: <strong>${order._id}</strong>.</p>
            <p>Thank you for your purchase!</p>
          `;

          const adminHtml = `
            <h2>New Payment Received</h2>
            <p>User: ${user.firstName || user.email}</p>
            <p>Email: ${user.email}</p>
            <p>Amount: <strong>$${payment.amount.toFixed(2)}</strong></p>
            <p>Order ID: <strong>${order._id}</strong></p>
            <p>Payment ID: <strong>${payment._id}</strong></p>
          `;

          // 3️⃣ Send emails
          const userEmailRes = await sendEmail({
            to: user.email,
            subject: "Payment Received ✅",
            html: userHtml,
          });

          if (config.email.adminEmail) {
            const adminEmailRes = await sendEmail({
              to: config.email.adminEmail,
              subject: "New Payment Received",
              html: adminHtml,
            });

            if (!adminEmailRes.success) {
              console.error(`❌ Failed to send email to admin:`, adminEmailRes.error);
            }
          } else {
            console.warn(`⚠️ Admin email not configured`);
          }

          if (!userEmailRes.success) {
            console.error(`❌ Failed to send email to user ${user.email}:`, userEmailRes.error);
          }
        }
      } catch (err) {
        console.error(`⚠️ Failed to check payment ${payment._id}:`, err);
      }
    }

    console.log(`✅ Completed check for ${pendingPayments.length} pending payments`);
  } catch (err) {
    console.error("⚠️ Cron job failed:", err);
  }
});
