import { Document, Types } from "mongoose";

export interface IRebarData {
  diameter: number;
  price: number;
  weight: number;
}

export interface IBendingData {
  thickness: number;
  rawsteel: number;
  galvanized: number;
  corten: number;
  teardrop: number;
  darkGreen: number;
  red: number;
  white: number;
}

export interface ICuttingData {
  thickness: number;
  rawsteel: number;
  galvanized: number;
  corten: number;
}

export interface ISteelConfig extends Document {
  // Rebar
  rebarData: IRebarData[];
  rebarLabourData: {
    startingPrice: number;
    pricePerKg: number;
  };
  rebarMarginData: {
    value: number;
  };

  // Bending
  bendingData: IBendingData[];
  bendingLabourData: {
    startingPrice: number;
    pricePerBend: number;
  };
  bendingMarginData: {
    value: number;
  };

  // Cutting
  cuttingMaterialData: ICuttingData[];
  cuttingLabourData: {
    startingPrice: number;
    priceInternal: number;
  };
  cuttingMarginData: {
    value: number;
  };
}