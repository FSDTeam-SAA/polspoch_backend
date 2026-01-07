import { Schema, model, Document } from 'mongoose';

export interface ICuttingDimension {
  key: string;
  label: string;
  minRange: number;
  maxRange: number;
  unit: string;
}

export interface ICuttingTemplate extends Document {
  type: string;
  templateId: string;
  shapeName: string;
  imageUrl: string;
  materials: string[];
  dimensions: ICuttingDimension[];
  cuts: number; // Simple number field as requested
  isActive: boolean;
}

const CuttingTemplateSchema = new Schema<ICuttingTemplate>(
  {
    type: { 
      type: String, 
      default: 'CUTTING', 
      required: true, 
      index: true 
    },
    templateId: { type: String, required: true, unique: true,trim: true},
    shapeName: { type: String, required: true },
    imageUrl: { type: String, required: false},
      materials: [
    {
      material: { type: String, required: true },
      thickness: { type: [Number], default: [] } 
    }
  ],
    dimensions: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        minRange: { type: Number, required: true },
        maxRange: { type: Number, required: true },
        unit: { type: String, default: 'MM' }
      }
    ],
    cuts: { 
      type: Number, 
      default: 0 // Number of cuts/holes assigned to this template
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model<ICuttingTemplate>('CuttingTemplate', CuttingTemplateSchema);