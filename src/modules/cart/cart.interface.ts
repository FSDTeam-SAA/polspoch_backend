import { Types } from "mongoose";

export interface ICart {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  serviceId: Types.ObjectId;
  quantity: number;
  totalAmount: number;
}
