import mongoose, { Schema, model } from "mongoose";
import { IService } from "./service.interface";

const ServiceSchema = new Schema<IService>({

  serviceType: { 
    type: String, 
    required: true, 
    enum: ["rebar", "bending", "cutting"] 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  // Common fields
  templateName: { type: String },
  units: { type: Number },
  price: { type: Number },

  // Rebar-specific
  diameter: { type: Number },
  sizes: { type: Schema.Types.Mixed, default: {} }, // Flexible object for sizes A, B, C, D

  // Bending-specific
  thickness: { type: Number },
  material: { type: String },
  degrees: { type: Schema.Types.Mixed, default: {} }, // degree1, degree2
  length: { type: Number },

  // Cutting-specific
  internalCuts: { type: Number },
  size: { type: Number },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update updatedAt automatically
ServiceSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Service = model<IService>("Service", ServiceSchema);

export default Service;
