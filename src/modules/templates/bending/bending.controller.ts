import { Request, Response } from 'express';
import BendingTemplate from './bending.model';
import { uploadToCloudinary } from '../../../utils/cloudinary';

// // @desc    Get all templates filtered by type 'bending'
// export const getbendingTemplates = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Querying specifically by the 'type' field
//     const templates = await BendingTemplate.find({ type: 'BENDING' });
//     res.status(200).json({ success: true, data: templates });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Update template image
// export const updateTemplateImage = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { templateId } = req.params;
//     const files = req.files as Express.Multer.File[];
    
//     if (!files || files.length === 0) {
//       res.status(400).json({ success: false, message: "No image file provided" });
//       return;
//     }

//     const uploaded = await uploadToCloudinary(files[0].path, 'bending-templates');
    
//     const updatedTemplate = await BendingTemplate.findOneAndUpdate(
//       { templateId },
//       { $set: { imageUrl: uploaded.secure_url } },
//       { new: true }
//     );

//     res.status(200).json({ success: true, data: updatedTemplate });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Change ranges for Size A, B, or C
// export const updateTemplateData = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { templateId, key, newLabel, min, max } = req.body;

//     if (!templateId || !key) {
//       res.status(400).json({ success: false, message: "templateId and key are required" });
//       return;
//     }

//     const updateFields: any = {};
//     if (newLabel !== undefined) updateFields["dimensions.$[dim].label"] = newLabel;
//     if (min !== undefined) updateFields["dimensions.$[dim].minRange"] = min;
//     if (max !== undefined) updateFields["dimensions.$[dim].maxRange"] = max;

//     const updatedTemplate = await BendingTemplate.findOneAndUpdate(
//       { templateId },
//       { $set: updateFields },
//       {
//         new: true,
//         runValidators: true,
//         arrayFilters: [{ "dim.key": key }]
//       }
//     );

//     if (!updatedTemplate) {
//       res.status(404).json({ success: false, message: "Template or Field Key not found" });
//       return;
//     }

//     res.status(200).json({ success: true, data: updatedTemplate });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


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
      res.status(400).json({
        success: false,
        message: 'templateId is required'
      });
      return;
    }

    const exists = await BendingTemplate.findOne({ templateId });
    if (exists) {
      res.status(409).json({
        success: false,
        message: 'Template already exists'
      });
      return;
    }

    const template = await BendingTemplate.create({
      ...req.body,
      type: 'BENDING'
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

    const updated = await BendingTemplate.findOneAndUpdate(
      { templateId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   UPDATE (PARTIAL – DIMENSION)
====================================================== */

// @desc Update dimension range/label
export const updateTemplateDimension = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId, key, newLabel, min, max } = req.body;

    if (!templateId || !key) {
      res.status(400).json({
        success: false,
        message: 'templateId and key are required'
      });
      return;
    }

    const updateFields: any = {};
    if (newLabel !== undefined)
      updateFields['dimensions.$[dim].label'] = newLabel;
    if (min !== undefined)
      updateFields['dimensions.$[dim].minRange'] = min;
    if (max !== undefined)
      updateFields['dimensions.$[dim].maxRange'] = max;

    const updated = await BendingTemplate.findOneAndUpdate(
      { templateId },
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ 'dim.key': key }]
      }
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Template or dimension not found'
      });
      return;
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   UPDATE IMAGE
====================================================== */

// @desc Update template image
export const updateBendingTemplateImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No image provided'
      });
      return;
    }

    const uploaded = await uploadToCloudinary(
      files[0].path,
      'bending-templates'
    );

    const updated = await BendingTemplate.findOneAndUpdate(
      { templateId },
      { $set: { imageUrl: uploaded.secure_url } },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

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