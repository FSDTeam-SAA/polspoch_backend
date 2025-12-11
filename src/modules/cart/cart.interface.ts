import { Types } from "mongoose";

export interface ICart {
  userId: Types.ObjectId;
  product: {
    productId?: Types.ObjectId;
    featuredId?: Types.ObjectId;
    size: number;
    unitSize: number;
    range: number;
    // features?: any[];
  };
  serviceId: Types.ObjectId;
  type: string;
  quantity: number;
  totalAmount: number;
}
