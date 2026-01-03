import { Schema, model, Document } from 'mongoose';

export interface IDimension {
  key: string;
  label: string;
  minRange?: number;
  maxRange?: number;
  unit?: string;
  isCalculated?: boolean;
  formula?: string;
}

export interface IRebarShape extends Document {
  type: string;
  templateId: string;
  shapeName: string;
  imageUrl: string;
  availableDiameters: number[];
  dimensions: IDimension[];
}

const RebarShapeSchema = new Schema<IRebarShape>({
  type: { type: String, default: 'REBAR' },
  templateId: { type: String, required: true, unique: true },
  shapeName: { type: String, required: true },
  imageUrl: { type: String, required: false },
  availableDiameters: { type: [Number], default: [6, 8, 10, 12, 16, 20, 25] },
  dimensions: [{
    key: String,
    label: String,
    minRange: Number,
    maxRange: Number,
    unit: { type: String, default: 'MM' },
    isCalculated: { type: Boolean, default: false },
    formula: String
  }]
});

export default model<IRebarShape>('RebarShape', RebarShapeSchema);