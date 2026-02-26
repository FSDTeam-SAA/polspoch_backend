import { model, Schema } from "mongoose";
import { IOrderShippingPolicy } from "./orderShippingPolicy.interface";

const orderShippingPolicySchema = new Schema<IOrderShippingPolicy>(
  {
    shippingMethod: { type: String, required: true },
    limits: { type: String, required: true },
    minPrice: { type: Number, required: true },
    Extras: { type: String, required: true },
    maxPrice: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const orderShippingPolicy = model<IOrderShippingPolicy>(
  "OrderShippingPolicy",
  orderShippingPolicySchema,
);

export default orderShippingPolicy;
