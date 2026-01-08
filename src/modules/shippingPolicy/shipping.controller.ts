import { Request, Response } from "express";
import { ShippingPolicy } from "./shipping.model";

/**
 * GET: Retrieve all shipping policies (Courier and Truck)
 * This is used to populate the Admin Dashboard form.
 */
export const getAllPolicies = async (req: Request, res: Response):Promise<void>  => {
  try {
    const policies = await ShippingPolicy.find();
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPolicyByName = async (req: Request, res: Response):Promise<void>  => {
  try {
    const { methodName } = req.params; // 'courier' or 'truck'
    const policy = await ShippingPolicy.findOne({ methodName });

    if (!policy) {
      res.status(404).json({ message: "Policy not found" });
      return;
    }
    res.status(200).json(policy);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * PATCH/PUT: Update a specific policy
 * This allows the admin to change basePrice, extraWeightPrice, etc.
 */
export const updatePolicy = async (req: Request, res: Response):Promise<void>  => {
  try {
    const { methodName } = req.params;
    const updateData = req.body;

    // Validation: Ensure we don't change the methodName itself
    delete updateData.methodName;

    const updatedPolicy = await ShippingPolicy.findOneAndUpdate(
      { methodName },
      { $set: updateData },
      { new: true, runValidators: true } // runValidators ensures Enum and types are checked
    );

    if (!updatedPolicy) {
      res.status(404).json({ message: "Policy not found" });
      return;
    }

    res.status(200).json({
      message: "Shipping policy updated successfully",
      data: updatedPolicy,
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
