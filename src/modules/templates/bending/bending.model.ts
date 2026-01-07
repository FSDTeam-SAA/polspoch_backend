import { Schema, model, Document } from 'mongoose';

export interface IBendingDimension {
  key: string;       // e.g., 'size_a'
  label: string;     // e.g., 'SIZE A'
  minRange: number;
  maxRange: number;
  unit: string;      // 'MM' or 'º'
}

export interface IBendingTemplate extends Document {
  type: string;          // Will be 'CUTTING'
  templateId: string;    // e.g., 'template-l'
  shapeName: string;     // e.g., 'L SHAPE'
  imageUrl: string;
  materials: string[];
  bend:number;   // ['RAWSEEL', 'TEARDROP']
  dimensions: IBendingDimension[];
}

const BendingTemplateSchema = new Schema<IBendingTemplate>(
  {
    type: { 
      type: String, 
      default: 'BENDING', // Identical field for all these templates
      required: true,
      index: true // Indexed for faster querying
    },
    templateId: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    shapeName: { 
      type: String, 
      required: true 
    },
    imageUrl: { 
      type: String, 
      required: false
    },
   
         materials: [
    {
      material: { type: String, required: true },
      thickness: { type: [Number], default: [] } 
    }
  ],
    bend:{type:Number},
    dimensions: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        minRange: { type: Number, required: true },
        maxRange: { type: Number, required: true },
        unit: { type: String, default: 'MM' }
      }
    ]
  },
  { timestamps: true }
);

export default model<IBendingTemplate>('BendingTemplate', BendingTemplateSchema);