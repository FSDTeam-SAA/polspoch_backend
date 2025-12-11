import { model, Schema, Types } from "mongoose";
import { ICart } from "./cart.interface";

const cartModel = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    product: {
      productId: {
        type: Types.ObjectId,
        ref: "Product",
      },
      featuredId: {
        type: Types.ObjectId,
        ref: "Product",
      },
      size: {
        type: Number,
      },
      unitSize: {
        type: Number,
      },
      range: {
        type: Number,
      },
    },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    type: { type: String },
    quantity: { type: Number },
    totalAmount: { type: Number },
  },
  { timestamps: true, versionKey: false }
);

const Cart = model<ICart>("Cart", cartModel);

export default Cart;
