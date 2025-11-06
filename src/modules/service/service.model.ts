import { Schema, model } from "mongoose";
import { IService } from "./service.interface";


const ServiceSchema = new Schema<IService>(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    material: {
      type: [String],
      default: [],
    },
    thickness: {
      type: [Number],
      default: [],
    },
    aLength: {
      type: String,
      trim: true,
    },
    bLength: {
      type: String,
      trim: true,
    },
    cLength: {
      type: String,
      trim: true,
    },
    dLength: {
      type: String,
      trim: true,
    },
    eLength: {
      type: String,
      trim: true,
    },
    fLength: {
      type: String,
      trim: true,
    },
    serviceInfo: [
      {
        title: { type: String, trim: true },
        description: { type: String },
      },
    ],
    technicalInfo: [
      {
        title: { type: String, trim: true },
        maximumDimension: { type: String, trim: true },
        thickness: { type: String, trim: true },
        look: { type: String, trim: true },
        application: { type: String, trim: true },
        defect: { type: String, trim: true },
        reference: { type: String, trim: true },
        technicalSheet: { type: String, trim: true },
        images: [
          {
            public_id: { type: String, required: true },
            url: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const Service = model<IService>("Service", ServiceSchema);
