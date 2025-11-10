import { Types } from "mongoose";

export interface IOrder {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  serviceId: Types.ObjectId;
  cartItems: [cartId: Types.ObjectId, quantity: number];
  status: string;
  type: string;
  totalAmount: number;
  paymentStatus: string;
  purchaseDate: Date;
}
