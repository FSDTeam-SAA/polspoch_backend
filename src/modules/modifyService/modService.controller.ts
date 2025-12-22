import { Request, Response } from "express";
import { SteelConfig } from "./modService.model";

export const SteelConfigController = {
  // GET: Fetches the single configuration document
  getConfig: async (req: Request, res: Response): Promise<any> => {
    try {
      let config = await SteelConfig.findOne({});
      if (!config) {
        config = await SteelConfig.create({});
      }
      return res.status(200).json({ success: true, data: config });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // PUT: Updates only the specific service type provided (rebar, bending, or cutting)
  updateConfig: async (req: Request, res: Response): Promise<any> => {
    try {
      const { type, materialData, labour, margin } = req.body;

      // 1. Validate that a valid type is provided
      const validTypes = ["rebar", "bending", "cutting"];
      if (!type || !validTypes.includes(type)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid or missing type. Must be 'rebar', 'bending', or 'cutting'." 
        });
      }

      // 2. Build a dynamic update object using dot notation
      // This ensures that updating 'rebar' doesn't delete 'bending' or 'cutting'
      const updateData: any = {};
      
      if (materialData) updateData[`${type}.materialData`] = materialData;
      if (labour) updateData[`${type}.labour`] = labour;
      if (margin !== undefined) updateData[`${type}.margin`] = margin;

      // 3. Update the document
      const updatedConfig = await SteelConfig.findOneAndUpdate(
        {}, 
        { $set: updateData }, 
        { new: true, upsert: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: `${type.toUpperCase()} configuration updated successfully`,
        data: updatedConfig,
      });
    } catch (error: any) {
      return res.status(400).json({ 
        success: false, 
        message: "Update failed", 
        error: error.message 
      });
    }
  }
};