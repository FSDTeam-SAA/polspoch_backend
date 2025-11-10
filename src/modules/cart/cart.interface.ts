import { Types } from "mongoose";

export interface ICart {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  serviceId: Types.ObjectId;
  type: string;
  quantity: number;
  totalAmount: number;
}
