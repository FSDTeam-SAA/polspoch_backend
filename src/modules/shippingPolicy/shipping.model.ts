import { Document, Schema, model } from 'mongoose';

export interface IShippingPolicy extends Document {
    methodName: 'courier' | 'truck';
    basePrice: number;
    freeWeightLimit: number;
    extraWeightPrice: number;
    extraWeightStep: number;
    sizeThreshold: number;
    sizeSurcharge: number;
    maxSizeAllowed: number;
    maxTotalCost: number;
    createdAt: Date;
    updatedAt: Date;
}

const ShippingPolicySchema = new Schema<IShippingPolicy>({
    methodName: { 
        type: String, 
        required: true, 
        enum: ['courier', 'truck'] 
    },
    basePrice: { type: Number, default: 0 },
    freeWeightLimit: { type: Number, default: 0 },
    extraWeightPrice: { type: Number, default: 0 },
    extraWeightStep: { type: Number, default: 1 },
    sizeThreshold: { type: Number, default: 2000 },
    sizeSurcharge: { type: Number, default: 0 },
    maxSizeAllowed: { type: Number, default: 2500 },
    maxTotalCost: { type: Number, default: 99999 }
}, { timestamps: true });

export const ShippingPolicy = model<IShippingPolicy>('ShippingPolicy', ShippingPolicySchema);