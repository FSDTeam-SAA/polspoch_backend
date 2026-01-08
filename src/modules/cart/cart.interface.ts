
import { Document, Types } from "mongoose";

export interface ICart extends Document {
  userId: Types.ObjectId;
  
  // Existing Product Structure
  product?: {
    productId?: Types.ObjectId;
    featuredId?: Types.ObjectId;
    size?: number;
    unitSize?: number;
    range?: number;
  };

  // Service Calculation Structure
  serviceData?: {
    // Shared fields
    shapeName?: string;
    material?: string;
    thickness?: number;  // Cutting/Bending
    diameter?: number;   // Rebar
    units?: number;
    serviceType?: string 
    // Dimension fields
    sizeA?: number;
    sizeB?: number;
    sizeC?: number;
    sizeD?: number;
    sizeE?: number;
    sizeF?: number;
    
    // Specific metrics
    length?: number;      // Bending Length
    totalLength?: number; // Rebar Length
    totalWidth?: number;  // Cutting/Bending Total Width
    internalCuts?: number;
    numBends?: number;

    // Nested Degrees for Bending
    degrees?: {
      degree1?: number;
      degree2?: number;
      degree3?: number;
      degree4?: number;
      degree5?: number;
      degree6?: number;
    };

    // Calculation Results (Snapshots)
    totalWeight: number;
    productPrice: number;
    pricePerUnit: number;
    shippingPrice: number;
    shippingMethod: string;
    maxDimensionDetected: number;
    isOversized: boolean;
  };

  serviceId?: Types.ObjectId;
  type: string;
  quantity: number;
  totalAmount: number; // Represents 'finalQuote'
  createdAt: Date;
  updatedAt: Date;
}