import { Request, Response } from 'express';
import RebarShape from '../rebar/rebar.model'
import { uploadToCloudinary } from '../../../utils/cloudinary';

// @desc    Get all rebar templates
// export const getTemplates = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const templates = await RebarShape.find();
//     res.status(200).json({ success: true, data: templates });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Get a single template by Template ID
// export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const template = await RebarShape.findOne({ templateId: req.params.templateId });
//     if (!template) {
//       res.status(404).json({ success: false, message: "Template not found" });
//       return;
//     }
//     res.status(200).json({ success: true, data: template });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Update specific template image
// export const updateTemplateImage = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // FIX 1: Destructure the specific field from params
//     const { templateId } = req.params; 
    
//     const files = req.files as Express.Multer.File[];
//     let newImageUrl: string | undefined;

//     if (files && files.length > 0) {
//       const file = files[0];
//       const uploaded = await uploadToCloudinary(file.path, 'rebar-templates');
//       newImageUrl = uploaded.secure_url;
//     }

//     if (!newImageUrl) {
//       res.status(400).json({ success: false, message: "No image file provided" });
//       return;
//     }

//     // FIX 2: Use the string value to find the document
//     const updatedTemplate = await RebarShape.findOneAndUpdate(
//       { templateId: templateId }, // Or just { templateId } now that it's a string
//       { $set: { imageUrl: newImageUrl } },
//       { new: true }
//     );

//     if (!updatedTemplate) {
//       res.status(404).json({ success: false, message: "Template not found" });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       message: `Image for ${updatedTemplate.shapeName} updated successfully`,
//       data: updatedTemplate
//     });

//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
// // @desc    Update specific field labels
// export const updateFieldLabel = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { templateId, key, newLabel, min, max } = req.body;

//     const updatedTemplate = await RebarShape.findOneAndUpdate(
//       { templateId },
//       {
//         $set: {
//           "dimensions.$[dim].label": newLabel,
//           "dimensions.$[dim].minRange": min,
//           "dimensions.$[dim].maxRange": max
//         }
//       },
//       {
//         new: true,
//         arrayFilters: [{ "dim.key": key }]
//       }
//     );

//     if (!updatedTemplate) {
//       res.status(404).json({ success: false, message: "Template or Field Key not found" });
//       return;
//     }

//     res.status(200).json({ success: true, data: updatedTemplate });
//   } catch (error: any) {
//     console.error(error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



/* ======================================================
   GET ALL
====================================================== */
export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const templates = await RebarShape.find();
    res.status(200).json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   GET SINGLE
====================================================== */
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

/* ======================================================
   CREATE
====================================================== */
export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.body;

    if (!templateId) {
      res.status(400).json({ success: false, message: "templateId is required" });
      return;
    }

    const exists = await RebarShape.findOne({ templateId });
    if (exists) {
      res.status(409).json({ success: false, message: "Template already exists" });
      return;
    }

    const template = await RebarShape.create({ ...req.body, type: 'REBAR' });
    res.status(201).json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   FULL UPDATE (ALL FIELDS)
====================================================== */
export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;

    const updated = await RebarShape.findOneAndUpdate(
      { templateId },
      { $set: req.body }, // Full update of all fields
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: "Template not found" });
      return;
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   PARTIAL UPDATE (DIMENSION OR SPECIFIC FIELDS)
====================================================== */
export const updateFieldLabel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId, key, newLabel, min, max, isCalculated, formula } = req.body;

    if (!templateId || !key) {
      res.status(400).json({ success: false, message: "templateId and key are required" });
      return;
    }

    const updateFields: any = {};
    if (newLabel !== undefined) updateFields["dimensions.$[dim].label"] = newLabel;
    if (min !== undefined) updateFields["dimensions.$[dim].minRange"] = min;
    if (max !== undefined) updateFields["dimensions.$[dim].maxRange"] = max;
    if (isCalculated !== undefined) updateFields["dimensions.$[dim].isCalculated"] = isCalculated;
    if (formula !== undefined) updateFields["dimensions.$[dim].formula"] = formula;

    const updatedTemplate = await RebarShape.findOneAndUpdate(
      { templateId },
      { $set: updateFields },
      { new: true, arrayFilters: [{ "dim.key": key }] }
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

/* ======================================================
   UPDATE IMAGE
====================================================== */
export const updateTemplateImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: "No image file provided" });
      return;
    }

    const uploaded = await uploadToCloudinary(files[0].path, 'rebar-templates');

    const updatedTemplate = await RebarShape.findOneAndUpdate(
      { templateId },
      { $set: { imageUrl: uploaded.secure_url } },
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

/* ======================================================
   DELETE
====================================================== */
export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;

    const deleted = await RebarShape.findOneAndDelete({ templateId });

    if (!deleted) {
      res.status(404).json({ success: false, message: "Template not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Template deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
