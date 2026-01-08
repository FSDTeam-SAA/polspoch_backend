import { model, Schema, Types } from "mongoose";
import { ICart } from "./cart.interface";

const cartModel = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    
    // Existing product structure for standard shop items
    product: {
      productId: { type: Types.ObjectId, ref: "Product" },
      featuredId: { type: Types.ObjectId, ref: "Product" },
      size: { type: Number },
      unitSize: { type: Number },
      range: { type: Number },
    },

    // Detailed storage for service calculations
    serviceData: {
      // 1. Common Identification
      shapeName: { type: String },
      material: { type: String },
      thickness: { type: Number }, // For Cutting & Bending
      diameter: { type: Number },  // For Rebar
      units: { type: Number },
      serviceType: { type: String },
      // 2. Dimensional Data (Flattened for easy access)
      sizeA: { type: Number },
      sizeB: { type: Number },
      sizeC: { type: Number },
      sizeD: { type: Number },
      sizeE: { type: Number },
      sizeF: { type: Number },
      
      // 3. Service Specifics
      length: { type: Number },      // Bending total length
      totalLength: { type: Number }, // Rebar total calculated length
      totalWidth: { type: Number },  // Cutting/Bending total width
      internalCuts: { type: Number },// Cutting only
      numBends: { type: Number },     // Bending only
      
      // 4. Degrees (Nested to match your Bending response)
      degrees: {
        degree1: { type: Number },
        degree2: { type: Number },
        degree3: { type: Number },
        degree4: { type: Number },
        degree5: { type: Number },
        degree6: { type: Number },
      },

      // 5. Calculation Snapshots
      totalWeight: { type: Number },
      productPrice: { type: Number },
      pricePerUnit: { type: Number },
      shippingPrice: { type: Number },
      shippingMethod: { type: String },
      maxDimensionDetected: { type: Number },
      isOversized: { type: Boolean }
    },

    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    type: { 
      type: String, 
    
    },
    quantity: { type: Number },
    totalAmount: { type: Number }, // This should be the 'finalQuote'
  },
  { timestamps: true, versionKey: false }
);

const Cart = model<ICart>("Cart", cartModel);
export default Cart;