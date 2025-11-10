import { model, Schema } from "mongoose";
import { IOrder } from "./order.interface";

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    cartItems: [
      {
        cartId: { type: Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    type: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    purchaseDate: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

const Order = model<IOrder>("Order", OrderSchema);
export default Order;
