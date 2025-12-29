import { Request, Response } from 'express';
import BendingTemplate from './bending.model';
import { uploadToCloudinary } from '../../../utils/cloudinary';

// @desc    Get all templates filtered by type 'bending'
export const getbendingTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    // Querying specifically by the 'type' field
    const templates = await BendingTemplate.find({ type: 'BENDING' });
    res.status(200).json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update template image
export const updateTemplateImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: "No image file provided" });
      return;
    }

    const uploaded = await uploadToCloudinary(files[0].path, 'bending-templates');
    
    const updatedTemplate = await BendingTemplate.findOneAndUpdate(
      { templateId },
      { $set: { imageUrl: uploaded.secure_url } },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedTemplate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Change ranges for Size A, B, or C
export const updateTemplateData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId, key, newLabel, min, max } = req.body;

    if (!templateId || !key) {
      res.status(400).json({ success: false, message: "templateId and key are required" });
      return;
    }

    const updateFields: any = {};
    if (newLabel !== undefined) updateFields["dimensions.$[dim].label"] = newLabel;
    if (min !== undefined) updateFields["dimensions.$[dim].minRange"] = min;
    if (max !== undefined) updateFields["dimensions.$[dim].maxRange"] = max;

    const updatedTemplate = await BendingTemplate.findOneAndUpdate(
      { templateId },
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ "dim.key": key }]
      }
    );

    if (!updatedTemplate) {
      res.status(404).json({ success: false, message: "Template or Field Key not found" });
      return;
    }

    res.status(200).json({ success: true, data: updatedTemplate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
