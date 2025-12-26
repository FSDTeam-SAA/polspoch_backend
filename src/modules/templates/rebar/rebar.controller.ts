import { Request, Response } from 'express';
import RebarShape from '../rebar/rebar.model'
import { uploadToCloudinary } from '../../../utils/cloudinary';

// @desc    Get all rebar templates
export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const templates = await RebarShape.find();
    res.status(200).json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get a single template by Template ID
export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const template = await RebarShape.findOne({ templateId: req.params.templateId });
    if (!template) {
      res.status(404).json({ success: false, message: "Template not found" });
      return;
    }
    res.status(200).json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update specific template image
export const updateTemplateImage = async (req: Request, res: Response): Promise<void> => {
  try {
    // FIX 1: Destructure the specific field from params
    const { templateId } = req.params; 
    
    const files = req.files as Express.Multer.File[];
    let newImageUrl: string | undefined;

    if (files && files.length > 0) {
      const file = files[0];
      const uploaded = await uploadToCloudinary(file.path, 'rebar-templates');
      newImageUrl = uploaded.secure_url;
    }

    if (!newImageUrl) {
      res.status(400).json({ success: false, message: "No image file provided" });
      return;
    }

    // FIX 2: Use the string value to find the document
    const updatedTemplate = await RebarShape.findOneAndUpdate(
      { templateId: templateId }, // Or just { templateId } now that it's a string
      { $set: { imageUrl: newImageUrl } },
      { new: true }
    );

    if (!updatedTemplate) {
      res.status(404).json({ success: false, message: "Template not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Image for ${updatedTemplate.shapeName} updated successfully`,
      data: updatedTemplate
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// @desc    Update specific field labels
export const updateFieldLabel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId, key, newLabel, min, max } = req.body;

    const updatedTemplate = await RebarShape.findOneAndUpdate(
      { templateId },
      {
        $set: {
          "dimensions.$[dim].label": newLabel,
          "dimensions.$[dim].minRange": min,
          "dimensions.$[dim].maxRange": max
        }
      },
      {
        new: true,
        arrayFilters: [{ "dim.key": key }]
      }
    );

    if (!updatedTemplate) {
      res.status(404).json({ success: false, message: "Template or Field Key not found" });
      return;
    }

    res.status(200).json({ success: true, data: updatedTemplate });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
