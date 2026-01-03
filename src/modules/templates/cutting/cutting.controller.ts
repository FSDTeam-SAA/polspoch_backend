import { Request, Response } from 'express';
import CuttingTemplate from './cutting.model';
import { uploadToCloudinary } from '../../../utils/cloudinary';

// // @desc    Get all templates filtered by type 'CUTTING'
// export const getCuttingTemplates = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const templates = await CuttingTemplate.find({ type: 'CUTTING' });
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

//     const uploaded = await uploadToCloudinary(files[0].path, 'cutting-templates');
    
//     const updatedTemplate = await CuttingTemplate.findOneAndUpdate(
//       { templateId },
//       { $set: { imageUrl: uploaded.secure_url } },
//       { new: true }
//     );

//     res.status(200).json({ success: true, data: updatedTemplate });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Flexible Update: Change cuts, shapeName, or specific Dimension Ranges
// export const updateCuttingTemplateData = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { templateId, key, newLabel, min, max, cuts, shapeName, materials, thicknesses } = req.body;

//     if (!templateId) {
//       res.status(400).json({ success: false, message: "templateId is required" });
//       return;
//     }

//     const updateFields: any = {};

//     // 1. Handle Top-Level Fields (cuts, name, arrays)
//     if (cuts !== undefined) updateFields["cuts"] = cuts;
//     if (shapeName !== undefined) updateFields["shapeName"] = shapeName;
//     if (materials !== undefined) updateFields["materials"] = materials;
//     if (thicknesses !== undefined) updateFields["thicknesses"] = thicknesses;

//     // 2. Handle Nested Dimensions (only if 'key' is provided)
//     if (key) {
//       if (newLabel !== undefined) updateFields["dimensions.$[dim].label"] = newLabel;
//       if (min !== undefined) updateFields["dimensions.$[dim].minRange"] = min;
//       if (max !== undefined) updateFields["dimensions.$[dim].maxRange"] = max;
//     }

//     const updatedTemplate = await CuttingTemplate.findOneAndUpdate(
//       { templateId },
//       { $set: updateFields },
//       {
//         new: true,
//         runValidators: true,
//         // Only apply array filter if we are updating a specific dimension key
//         arrayFilters: key ? [{ "dim.key": key }] : undefined 
//       }
//     );

//     if (!updatedTemplate) {
//       res.status(404).json({ success: false, message: "Template not found" });
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
export const createCuttingTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const template = await CuttingTemplate.create({
      ...req.body,
      type: 'CUTTING'
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
export const updateCuttingTemplateData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId, key, newLabel, min, max, cuts, shapeName, materials, thicknesses } = req.body;

    if (!templateId) {
      res.status(400).json({ success: false, message: "templateId is required" });
      return;
    }

    const updateFields: any = {};

    // Top-level fields
    if (cuts !== undefined) updateFields["cuts"] = cuts;
    if (shapeName !== undefined) updateFields["shapeName"] = shapeName;
    if (materials !== undefined) updateFields["materials"] = materials;
    if (thicknesses !== undefined) updateFields["thicknesses"] = thicknesses;

    // Nested dimensions
    if (key) {
      if (newLabel !== undefined) updateFields["dimensions.$[dim].label"] = newLabel;
      if (min !== undefined) updateFields["dimensions.$[dim].minRange"] = min;
      if (max !== undefined) updateFields["dimensions.$[dim].maxRange"] = max;
    }

    const updatedTemplate = await CuttingTemplate.findOneAndUpdate(
      { templateId },
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        arrayFilters: key ? [{ "dim.key": key }] : undefined
      }
    );

    if (!updatedTemplate) {
      res.status(404).json({ success: false, message: "Template not found" });
      return;
    }

    res.status(200).json({ success: true, data: updatedTemplate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   UPDATE IMAGE
====================================================== */

// @desc Update template image
export const updateTemplateImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { templateId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No image provided' });
      return;
    }

    const uploaded = await uploadToCloudinary(files[0].path, 'cutting-templates');

    const updated = await CuttingTemplate.findOneAndUpdate(
      { templateId },
      { $set: { imageUrl: uploaded.secure_url } },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Template not found' });
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
