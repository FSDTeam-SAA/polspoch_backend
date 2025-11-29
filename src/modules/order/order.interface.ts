import { Types } from "mongoose";

export interface ICartItem {
  cartId: Types.ObjectId | string;
  quantity: number;
}

export interface IOrder {
  userId?: Types.ObjectId;
  product: {
    productId?: Types.ObjectId;
    featuredId?: Types.ObjectId;
    size: number;
    unitSize: number;
    range: number;
  };

  serviceId?: Types.ObjectId;
  cartItems?: ICartItem[];
  type: "product" | "service" | "cart";
  status?: "pending" | "completed" | "rejected";
  paymentStatus?: "paid" | "unpaid";
  purchaseDate?: Date;
  quantity?: number;
  totalAmount?: number;
}