import { model, Schema } from "mongoose";
import { ICart } from "./cart.interface";

const cartModel = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    type: { type: String },
    quantity: { type: Number },
    totalAmount: { type: Number },
  },
  { timestamps: true, versionKey: false }
);

// cartModel.pre("save", function (next) {
//   this.type = "";
//   next();
// });

const Cart = model<ICart>("Cart", cartModel);

export default Cart;
