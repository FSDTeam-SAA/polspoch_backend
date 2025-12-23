import { model, Schema } from "mongoose";

const steelConfigSchema = new Schema(
  {
    // Grouped under "rebar"
    rebar: {
      materialData: [
        {
          diameter: { type: Number, required: true },
          price: { type: Number, default: 0 },
          weight: { type: Number, default: 0 },
        },
      ],
      labour: {
        startingPrice: { type: Number, default: 10 },
        pricePerKg: { type: Number, default: 0.2 },
      },
      margin: { type: Number, default: 1.6 },
    },

    // Grouped under "bending"
    bending: {
      materialData: [
        {
          thickness: { type: Number, required: true },
          rawsteel: { type: Number, default: 0 },
          galvanized: { type: Number, default: 0 },
          corten: { type: Number, default: 0 },
          teardrop: { type: Number, default: 0 },
          darkGreen: { type: Number, default: 0 },
          red: { type: Number, default: 0 },
          white: { type: Number, default: 0 },
        },
      ],
      labour: {
        startingPrice: { type: Number, default: 20 },
        pricePerBend: { type: Number, default: 8 },
      },
      margin: { type: Number, default: 1.8 },
    },

    // Grouped under "cutting"
    cutting: {
      materialData: [
        {
          thickness: { type: Number, required: true },
          rawsteel: { type: Number, default: 0 },
          galvanized: { type: Number, default: 0 },
          corten: { type: Number, default: 0 },
        },
      ],
      labour: {
        startingPrice: { type: Number, default: 20 },
        priceInternal: { type: Number, default: 1.5 },
      },
      margin: { type: Number, default: 1.6 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const SteelConfig = model("SteelConfig", steelConfigSchema);
