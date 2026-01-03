import { Request, Response } from 'express';
import BendingTemplate from './bending.model';
import { uploadToCloudinary } from '../../../utils/cloudinary';



/* ======================================================
   GET
====================================================== */

// @desc Get all bending templates
export const getBendingTemplates = async (
  _: Request,
  res: Response
): Promise<void> => {
  try {
    const templates = await BendingTemplate.find({ type: 'BENDING' });
    res.status(200).json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get single bending template
export const getSingleBendingTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId } = req.params;

    const template = await BendingTemplate.findOne({ templateId });

    if (!template) {
      res.status(404).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    res.status(200).json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   CREATE
====================================================== */

// @desc Create bending template
export const createBendingTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId } = req.body;

    if (!templateId) {
      res.status(400).json({ success: false, message: 'templateId is required' });
      return;
    }

    const exists = await BendingTemplate.findOne({ templateId });
    if (exists) {
      res.status(409).json({ success: false, message: 'Template already exists' });
      return;
    }

    // Parse arrays from Form-Data JSON strings
    const thicknesses = req.body.thicknesses ? JSON.parse(req.body.thicknesses) : undefined;
    const materials = req.body.materials ? JSON.parse(req.body.materials) : undefined;
    const dimensions = req.body.dimensions ? JSON.parse(req.body.dimensions) : undefined;

    // Handle image upload if provided
    let imageUrl;
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const uploaded = await uploadToCloudinary(files[0].path, 'bending-templates');
      imageUrl = uploaded.secure_url;
    }

    const template = await BendingTemplate.create({
      ...req.body,
      type: 'BENDING',
      thicknesses,
      materials,
      dimensions,
      imageUrl
    });

    res.status(201).json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
/* ======================================================
   UPDATE (FULL)
====================================================== */

// @desc Update entire bending template (no create)
export const updateBendingTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId } = req.params;

    if (!templateId) {
      res.status(400).json({ success: false, message: 'templateId param is required' });
      return;
    }

    const files = req.files as Express.Multer.File[];

    // Parse arrays from Form-Data JSON strings
    const updateFields: any = { ...req.body };
    if (req.body.thicknesses && typeof req.body.thicknesses === 'string') {
      updateFields.thicknesses = JSON.parse(req.body.thicknesses);
    }
    if (req.body.materials && typeof req.body.materials === 'string') {
      updateFields.materials = JSON.parse(req.body.materials);
    }
    if (req.body.dimensions && typeof req.body.dimensions === 'string') {
      updateFields.dimensions = JSON.parse(req.body.dimensions);
    }

    // Handle image upload if provided
    if (files && files.length > 0) {
      const uploaded = await uploadToCloudinary(files[0].path, 'bending-templates');
      updateFields.imageUrl = uploaded.secure_url;
    }

    // Full update of all fields including dimensions
    const updatedTemplate = await BendingTemplate.findOneAndUpdate(
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
   UPDATE (PARTIAL – DIMENSION)
====================================================== */



/* ======================================================
   DELETE
====================================================== */

// @desc Delete bending template
export const deleteBendingTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId } = req.params;

    const deleted = await BendingTemplate.findOneAndDelete({ templateId });

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};