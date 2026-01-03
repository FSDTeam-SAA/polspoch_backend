import { Request, Response } from 'express';
import RebarShape from '../rebar/rebar.model'
import { uploadToCloudinary } from '../../../utils/cloudinary';






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

    // Check if template already exists
    const exists = await RebarShape.findOne({ templateId });
    if (exists) {
      res.status(409).json({ success: false, message: "Template already exists" });
      return;
    }

    // Parse dimensions and availableDiameters if sent as strings in form-data
    if (req.body.dimensions && typeof req.body.dimensions === 'string') {
      req.body.dimensions = JSON.parse(req.body.dimensions);
    }
    if (req.body.availableDiameters && typeof req.body.availableDiameters === 'string') {
      req.body.availableDiameters = JSON.parse(req.body.availableDiameters);
    }

    // Handle image upload if a file is provided
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const uploaded = await uploadToCloudinary(files[0].path, 'rebar-templates');
      req.body.imageUrl = uploaded.secure_url;
    } else {
      res.status(400).json({ success: false, message: "Image file is required for template creation" });
      return;
    }

    // Create template
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


export const upsertRebarTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;

    if (!templateId) {
      res.status(400).json({ success: false, message: "templateId param is required" });
      return;
    }

    const files = req.files as Express.Multer.File[];

    // 1️⃣ Prepare update object
    const updateFields: any = { ...req.body };

   // ✅ Parse availableDiameters safely
    if (req.body.availableDiameters) {
      if (typeof req.body.availableDiameters === "string") {
        try {
          updateFields.availableDiameters = JSON.parse(req.body.availableDiameters);
        } catch {
          // fallback: comma-separated string
          updateFields.availableDiameters = req.body.availableDiameters
            .replace(/[\[\]\s]/g, "")
            .split(",")
            .map(Number);
        }
      } else if (Array.isArray(req.body.availableDiameters)) {
        updateFields.availableDiameters = req.body.availableDiameters.map(Number);
      }
    }

    // ✅ Parse dimensions if sent as string
    if (req.body.dimensions && typeof req.body.dimensions === "string") {
      updateFields.dimensions = JSON.parse(req.body.dimensions);
    }
    // 2️⃣ Handle image upload if file is provided
    if (files && files.length > 0) {
      const uploaded = await uploadToCloudinary(files[0].path, 'rebar-templates');
      updateFields.imageUrl = uploaded.secure_url;
    }

    // 3️⃣ Handle dimension-specific update if key is provided
    if (req.body.key) {
      const { key, newLabel, min, max, isCalculated, formula } = req.body;
      const dimensionUpdates: any = {};

      if (newLabel !== undefined) dimensionUpdates["dimensions.$[dim].label"] = newLabel;
      if (min !== undefined) dimensionUpdates["dimensions.$[dim].minRange"] = min;
      if (max !== undefined) dimensionUpdates["dimensions.$[dim].maxRange"] = max;
      if (isCalculated !== undefined) dimensionUpdates["dimensions.$[dim].isCalculated"] = isCalculated;
      if (formula !== undefined) dimensionUpdates["dimensions.$[dim].formula"] = formula;

      // Merge dimension updates into main update object
      Object.assign(updateFields, dimensionUpdates);

      const updatedTemplate = await RebarShape.findOneAndUpdate(
        { templateId },
        { $set: updateFields },
        {
          new: true,
          runValidators: true,
          arrayFilters: [{ "dim.key": key }]
        }
      );

      if (!updatedTemplate) {
        res.status(404).json({ success: false, message: "Template or dimension not found" });
        return;
      }

      res.status(200).json({ success: true, data: updatedTemplate });
      return;
    }

    // 4️⃣ Full update if no dimension key is provided
    const updatedTemplate = await RebarShape.findOneAndUpdate(
      { templateId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      res.status(404).json({ success: false, message: "Template not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: files && files.length > 0 ? `Template and image updated successfully` : `Template updated successfully`,
      data: updatedTemplate
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};