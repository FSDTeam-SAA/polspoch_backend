import { Request, Response } from "express";
import { SteelConfig } from "../modifyService/modService.model";
import { ShippingPolicy } from "./shipping.model";

export const calculateRebarQuote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      shapeName,
      diameter,
      units,
      sizeA,
      sizeB,
      sizeC,
      sizeD, // in mm
    } = req.body;

    // 1. Fetch all configurations in parallel for speed
    // We fetch the single config doc and both shipping policies
    const [config, courier, truck] = await Promise.all([
      SteelConfig.findOne(),
      ShippingPolicy.findOne({ methodName: "courier" }),
      ShippingPolicy.findOne({ methodName: "truck" }),
    ]);

    if (
      !config ||
      !config.rebar ||
      !config.rebar.labour ||
      !courier ||
      !truck
    ) {
      res
        .status(404)
        .json({ message: "Required database configurations are missing." });
      return;
    }

    // 2. Find Diameter specific data (Weight/M and Price/KG)
    const matData = config.rebar.materialData.find(
      (d) => d.diameter === diameter,
    );
    if (!matData) {
      res.status(400).json({ message: `Diameter ${diameter} not supported.` });
      return;
    }

    // 3. PRODUCT CALCULATION
    // Total Length (mm to meters)
    const lengthPerUnit =
      ((sizeA || 0) + (sizeB || 0) + (sizeC || 0) + (sizeD || 0)) / 1000;
    const totalWeight = lengthPerUnit * matData.weight * units;

    // Costing logic from Excel
    const materialTotal = totalWeight * matData.price;
    const labourTotal =
      config.rebar.labour.startingPrice +
      totalWeight * config.rebar.labour.pricePerKg;
    const totalProductPrice =
      (materialTotal + labourTotal) * config.rebar.margin;
    const pricePerUnit = totalProductPrice / units;
    // 4. SHIPPING CALCULATION
    // Find the longest side to determine if it fits in a courier van
    const maxDimension = Math.max(
      sizeA || 0,
      sizeB || 0,
      sizeC || 0,
      sizeD || 0,
    );
    let shippingCost = 0;
    let shippingMethod = "";

    // Check if it fits the Courier (Max 2500mm)
    if (maxDimension <= courier.maxSizeAllowed) {
      shippingMethod = "courier";
      let cost = courier.basePrice;

      // Extra Weight (> 30kg)
      if (totalWeight > courier.freeWeightLimit) {
        cost +=
          (totalWeight - courier.freeWeightLimit) * courier.extraWeightPrice;
      }

      // Extra Size (>= 2000mm)
      if (maxDimension >= courier.sizeThreshold) {
        cost += courier.sizeSurcharge;
      }

      // Apply Courier Maximum Cap (e.g., 150€)
      shippingCost = Math.min(cost, courier.maxTotalCost);
    } else {
      // Must use Truck (Exceeds 2500mm)
      shippingMethod = "truck";
      let cost = truck.basePrice;

      if (totalWeight > truck.freeWeightLimit) {
        const extraWeight = totalWeight - truck.freeWeightLimit;
        // Price per 500kg block
        const unitsOf500 = Math.ceil(extraWeight / truck.extraWeightStep);
        cost += unitsOf500 * truck.extraWeightPrice;
      }
      shippingCost = cost;
    }

    // 5. RESPONSE
    res.status(200).json({
      success: true,
      summary: {
        shape: shapeName,
        totalWeight: Number(totalWeight.toFixed(2)),
        totalLength: Number((lengthPerUnit * units).toFixed(2)),
        diameter,
        units,
        sizeA,
        sizeB,
        sizeC,
        sizeD,
      },
      pricing: {
        productPrice: Number(totalProductPrice.toFixed(2)),
        // totalPriceOfProduct:totalProductPrice,
        pricePerUnit,
        shippingPrice: Number(shippingCost.toFixed(2)),
        finalQuote: Number((totalProductPrice + shippingCost).toFixed(2)),
      },
      shippingStatus: {
        method: shippingMethod,
        isOversized: maxDimension > courier.maxSizeAllowed,
        maxDimensionDetected: maxDimension,
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

//!==========================================================================

export const calculateBendingQuote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      shapeName,
      material,
      thickness,
      units,
      length,
      sizeA,
      sizeB,
      sizeC,
      sizeD,
      sizeE,
      sizeF,
      degree1,
      degree2,
      degree3,
      degree4,
      degree5,
      degree6,
      numBends,
    } = req.body;

    // 1. Fetch configurations in parallel
    const [config, courier, truck] = await Promise.all([
      SteelConfig.findOne(),
      ShippingPolicy.findOne({ methodName: "courier" }),
      ShippingPolicy.findOne({ methodName: "truck" }),
    ]);

    if (!config?.bending || !config?.bending?.labour || !courier || !truck) {
      res
        .status(404)
        .json({ message: "Required database configurations are missing." });
      return;
    }

    // 2. Find Thickness & Material specific price
    const matData = config.bending.materialData.find(
      (d) => d.thickness === thickness,
    );
    if (!matData) {
      res.status(400).json({ message: `Thickness ${thickness}mm not found.` });
      return;
    }

    // Access price based on the material string (e.g., "galvanized", "rawsteel")
    const materialPricePerKg = (matData as any)[material.toLowerCase()];
    if (!materialPricePerKg || materialPricePerKg === 0) {
      res.status(400).json({
        message: `Material ${material} is not available for this thickness.`,
      });
      return;
    }

    // 3. PRODUCT CALCULATION
    const totalWidth =
      (sizeA || 0) +
      (sizeB || 0) +
      (sizeC || 0) +
      (sizeD || 0) +
      (sizeE || 0) +
      (sizeF || 0);

    // Weight Calculation: (m2) * (Thickness * 7.85)
    const areaPerUnit = (totalWidth / 1000) * (length / 1000);
    const weightPerUnit = areaPerUnit * (thickness * 7.85);
    const totalWeight = weightPerUnit * units;

    const materialTotal = totalWeight * materialPricePerKg;
    const labourTotal =
      config.bending.labour.startingPrice +
      (numBends || 0) * units * config.bending.labour.pricePerBend;

    const totalProductPrice =
      (materialTotal + labourTotal) * config.bending.margin;
    const pricePerUnit = Number((totalProductPrice / units).toFixed(2));

    // 4. SHIPPING CALCULATION
    const maxDimension = Math.max(length || 0, totalWidth || 0);
    let shippingCost = 0;
    let shippingMethod = "";

    if (maxDimension <= courier.maxSizeAllowed) {
      shippingMethod = "courier";
      let cost = courier.basePrice;
      if (totalWeight > courier.freeWeightLimit)
        cost +=
          (totalWeight - courier.freeWeightLimit) * courier.extraWeightPrice;
      if (maxDimension >= courier.sizeThreshold) cost += courier.sizeSurcharge;
      shippingCost = Math.min(cost, courier.maxTotalCost);
    } else {
      shippingMethod = "truck";
      let cost = truck.basePrice;
      if (totalWeight > truck.freeWeightLimit) {
        const extra = totalWeight - truck.freeWeightLimit;
        cost +=
          Math.ceil(extra / truck.extraWeightStep) * truck.extraWeightPrice;
      }
      shippingCost = cost;
    }

    // 5. RESPONSE (formatted exactly as requested)
    res.status(200).json({
      success: true,
      summary: {
        shape: shapeName,
        totalWeight: Number(totalWeight.toFixed(2)),
        totalWidth: totalWidth,
        length,
        units,
        thickness,
        material,
        // Include all size and degree inputs
        sizes: { sizeA, sizeB, sizeC, sizeD, sizeE, sizeF },
        degrees: { degree1, degree2, degree3, degree4, degree5, degree6 },
      },
      pricing: {
        productPrice: Number(totalProductPrice.toFixed(2)),
        pricePerUnit: pricePerUnit,
        shippingPrice: Number(shippingCost.toFixed(2)),
        finalQuote: Number((totalProductPrice + shippingCost).toFixed(2)),
      },
      shippingStatus: {
        method: shippingMethod,
        isOversized: maxDimension > courier.maxSizeAllowed,
        maxDimensionDetected: maxDimension,
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

//!____________________________________*****______________________________????

// export const calculateCuttingQuote = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const {
//       shapeName,
//       material,
//       thickness,
//       units,
//       sizeA,
//       sizeB,
//       internalCuts,
//     } = req.body;

//     console.log("req.body", req.body);

//     const [config, courier, truck] = await Promise.all([
//       SteelConfig.findOne(),
//       ShippingPolicy.findOne({ methodName: "courier" }),
//       ShippingPolicy.findOne({ methodName: "truck" }),
//     ]);

//     if (!config?.cutting || !config?.cutting?.labour || !courier || !truck) {
//       res.status(404).json({ message: "Configurations missing." });
//       return;
//     }

//     // 1. Find Price Data
//     const matData = config.cutting.materialData.find(
//       (d) => d.thickness === thickness,
//     );
//     if (!matData) {
//       res.status(400).json({ message: `Thickness ${thickness}mm not found.` });
//       return;
//     }

//     const materialPricePerKg = (matData as any)[material.toLowerCase()] || 0;

//     // 2. PRODUCT CALCULATION
//     // Area = (sizeA * sizeB) / 1,000,000 to get m2
//     const areaPerUnit = (sizeA * sizeB) / 1000000;
//     const weightPerUnit = areaPerUnit * (thickness * 8.16);
//     const totalWeight = weightPerUnit * units;

//     const materialTotal = totalWeight * materialPricePerKg;

//     // FIX: Accessing priceInternal via config.cutting.labour
//     const labourTotal =
//       config.cutting.labour?.startingPrice +
//       (internalCuts || 0) * units * config.cutting.labour?.priceInternal;

//     // Applying Margin
//     const totalProductPrice =
//       (materialTotal + labourTotal) * config.cutting.margin;
//     const pricePerUnit = totalProductPrice / units;

//     // 3. SHIPPING CALCULATION
//     const maxDimension = Math.max(sizeA || 0, sizeB || 0);
//     let shippingCost = 0;
//     let shippingMethod = "";

//     if (maxDimension <= courier.maxSizeAllowed) {
//       shippingMethod = "courier";
//       let calc = courier.basePrice;
//       if (totalWeight > courier.freeWeightLimit) {
//         calc +=
//           (totalWeight - courier.freeWeightLimit) * courier.extraWeightPrice;
//       }
//       if (maxDimension >= courier.sizeThreshold) {
//         calc += courier.sizeSurcharge;
//       }
//       shippingCost = Math.min(calc, courier.maxTotalCost);
//     } else {
//       shippingMethod = "truck";
//       let calc = truck.basePrice;
//       if (totalWeight > truck.freeWeightLimit) {
//         const extra = totalWeight - truck.freeWeightLimit;
//         calc +=
//           Math.ceil(extra / truck.extraWeightStep) * truck.extraWeightPrice;
//       }
//       shippingCost = calc;
//     }

//     // 4. FINAL RESPONSE
//     res.status(200).json({
//       success: true,
//       summary: {
//         shape: shapeName,
//         totalWeight: Number(totalWeight.toFixed(2)),
//         totalLength: sizeA,
//         totalWidth: sizeB,
//         units,
//         thickness,
//         material,
//         sizeA,
//         sizeB,
//         internalCuts,
//       },
//       pricing: {
//         productPrice: Number(totalProductPrice.toFixed(2)),
//         pricePerUnit: Number(pricePerUnit.toFixed(2)),
//         shippingPrice: Number(shippingCost.toFixed(2)),
//         finalQuote: Number((totalProductPrice + shippingCost).toFixed(2)),
//       },
//       shippingStatus: {
//         method: shippingMethod,
//         isOversized: maxDimension > courier.maxSizeAllowed,
//         maxDimensionDetected: maxDimension,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };

export const calculateCuttingQuote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      shapeName,
      material,
      thickness,
      units,
      sizeA,
      sizeB,
      internalCuts,
    } = req.body;

    console.log("req.body", req.body);

    const [config, courier, truck] = await Promise.all([
      SteelConfig.findOne(),
      ShippingPolicy.findOne({ methodName: "courier" }),
      ShippingPolicy.findOne({ methodName: "truck" }),
    ]);

    if (!config?.cutting || !config?.cutting?.labour || !courier || !truck) {
      res.status(404).json({ message: "Configurations missing." });
      return;
    }

    // 1. Find Price Data
    const matData = config.cutting.materialData.find(
      (d) => d.thickness === thickness,
    );
    if (!matData) {
      res.status(400).json({ message: `Thickness ${thickness}mm not found.` });
      return;
    }

    const materialPricePerKg = (matData as any)[material.toLowerCase()] || 0;

    // 2. PRODUCT CALCULATION
    let areaPerUnit = 0;

    if (shapeName === "DISC") {
      // sizeA = diameter
      const radius = sizeA / 2;
      areaPerUnit = (Math.PI * radius * radius) / 1000000; // mm² → m²
    } else {
      // Rectangle or Square fallback
      const width = sizeB || sizeA; // If no B provided, assume square
      areaPerUnit = (sizeA * width) / 1000000;
    }

    // Weight calculation (Steel density approx 8.16 g/cm³ = 8160 kg/m³)
    const weightPerUnit = areaPerUnit * (thickness * 8.16);
    const totalWeight = weightPerUnit * units;

    const materialTotal = totalWeight * materialPricePerKg;

    const labourTotal =
      config.cutting.labour?.startingPrice +
      (internalCuts || 0) * units * config.cutting.labour?.priceInternal;

    const totalProductPrice =
      (materialTotal + labourTotal) * config.cutting.margin;
    const pricePerUnit = totalProductPrice / units;

    // 3. SHIPPING CALCULATION
    const maxDimension = sizeB ? Math.max(sizeA, sizeB) : sizeA;
    let shippingCost = 0;
    let shippingMethod = "";

    if (maxDimension <= courier.maxSizeAllowed) {
      shippingMethod = "courier";
      let calc = courier.basePrice;
      if (totalWeight > courier.freeWeightLimit) {
        calc +=
          (totalWeight - courier.freeWeightLimit) * courier.extraWeightPrice;
      }
      if (maxDimension >= courier.sizeThreshold) {
        calc += courier.sizeSurcharge;
      }
      shippingCost = Math.min(calc, courier.maxTotalCost);
    } else {
      shippingMethod = "truck";
      let calc = truck.basePrice;
      if (totalWeight > truck.freeWeightLimit) {
        const extra = totalWeight - truck.freeWeightLimit;
        calc +=
          Math.ceil(extra / truck.extraWeightStep) * truck.extraWeightPrice;
      }
      shippingCost = calc;
    }

    // 4. FINAL RESPONSE
    res.status(200).json({
      success: true,
      summary: {
        shape: shapeName,
        totalWeight: Number(totalWeight.toFixed(2)),
        sizeA,
        sizeB: sizeB || null,
        units,
        thickness,
        material,
        internalCuts,
      },
      pricing: {
        productPrice: Number(totalProductPrice.toFixed(2)),
        pricePerUnit: Number(pricePerUnit.toFixed(2)),
        shippingPrice: Number(shippingCost.toFixed(2)),
        finalQuote: Number((totalProductPrice + shippingCost).toFixed(2)),
      },
      shippingStatus: {
        method: shippingMethod,
        isOversized: maxDimension > courier.maxSizeAllowed,
        maxDimensionDetected: maxDimension,
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
