import { Types } from "mongoose";

export interface IPayment {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  amount: number;
  status: "pending" | "success" | "failed";
  transactionId?: string;
  checkoutSessionId?:string
  createdAt: Date;
  updatedAt: Date;
}
