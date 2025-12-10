import { Types } from "mongoose";

export interface IService {
  serviceType: "rebar" | "bending" | "cutting"; // Type of service

  // Common fields
 userId?: Types.ObjectId;
  templateName?: string; // Optional template name
  units?: number;
  price?: number;

  // Rebar-specific
  diameter?: number;
  sizes?: { [key: string]: number }; // Flexible object, keys like A, B, C, D

  // Bending-specific
  thickness?: number;
  material?: string;
  degrees?: { [key: string]: number }; // degree1, degree2
  length?: number;

  // Cutting-specific
  internalCuts?: number;
  size?: number;

  createdAt?: Date;
  updatedAt?: Date;
}
