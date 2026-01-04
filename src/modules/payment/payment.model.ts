import { model, Schema } from "mongoose";
import { IPayment } from "./payment.interface";

const paymentModel = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      required: true,
    },
    transactionId: { type: String },
      checkoutSessionId: {
      type: String,
      index: true,
    },
  },
  
  {
    timestamps: true,
  }
);


const Payment = model<IPayment>("Payment", paymentModel);

export default Payment;
