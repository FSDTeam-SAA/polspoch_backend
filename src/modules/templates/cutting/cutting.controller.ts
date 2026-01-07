import { Request, Response } from 'express';
import CuttingTemplate from './cutting.model';
import { uploadToCloudinary } from '../../../utils/cloudinary';





/* ======================================================
   GET
====================================================== */

// @desc Get all cutting templates
export const getCuttingTemplates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const templates = await CuttingTemplate.find({ type: 'CUTTING' });
    res.status(200).json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   CREATE
====================================================== */

// @desc Create new cutting template
export const createCuttingTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.body;

    if (!templateId) {
      res.status(400).json({ success: false, message: 'templateId is required' });
      return;
    }

    const exists = await CuttingTemplate.findOne({ templateId });
    if (exists) {
      res.status(409).json({ success: false, message: 'Template already exists' });
      return;
    }

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'Template image is required' });
      return;
    }

    // Upload image to Cloudinary
    const uploaded = await uploadToCloudinary(files[0].path, 'cutting-templates');

    // Parse arrays and dimensions if sent as strings
    let materials = req.body.materials;
if (typeof materials === 'string') materials = JSON.parse(materials);


    let dimensions = req.body.dimensions;
    if (typeof dimensions === 'string') dimensions = JSON.parse(dimensions);

    const template = await CuttingTemplate.create({
      ...req.body,
      type: 'CUTTING',
      imageUrl: uploaded.secure_url,
     
      materials,
      dimensions
    });

    res.status(201).json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   UPDATE (FLEXIBLE)
====================================================== */

// @desc Flexible update: top-level fields or specific dimension
export const updateCuttingTemplateData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    if (!templateId) {
      res.status(400).json({ success: false, message: 'templateId param is required' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const updateFields: any = { ...req.body };

    // Parse arrays if sent as strings
  if (req.body.materials && typeof req.body.materials === 'string') {
  try {
    updateFields.materials = JSON.parse(req.body.materials);
  } catch {
    // optional: fallback parsing
    updateFields.materials = [];
  }
}


 

    if (req.body.dimensions && typeof req.body.dimensions === 'string') {
      updateFields.dimensions = JSON.parse(req.body.dimensions);
    }

    // Handle image upload
    if (files && files.length > 0) {
      const uploaded = await uploadToCloudinary(files[0].path, 'cutting-templates');
      updateFields.imageUrl = uploaded.secure_url;
    }

    const updatedTemplate = await CuttingTemplate.findOneAndUpdate(
      { templateId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: files && files.length > 0 ? 'Template and image updated successfully' : 'Template updated successfully',
      data: updatedTemplate
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};




/* ======================================================
   DELETE
====================================================== */

// @desc Delete cutting template
export const deleteCuttingTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId } = req.params;

    const deleted = await CuttingTemplate.findOneAndDelete({ templateId });

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Template deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
