import { model, Schema } from "mongoose";
import { ICart } from "./cart.interface";

const cartModel = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
  quantity: { type: Number },
  totalAmount: { type: Number },
});

const Cart = model<ICart>("Cart", cartModel);

export default Cart;
