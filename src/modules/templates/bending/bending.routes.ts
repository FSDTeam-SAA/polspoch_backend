import { Router } from 'express';
import {
  getBendingTemplates,
  getSingleBendingTemplate,
  createBendingTemplate,
  updateBendingTemplate,
  updateTemplateDimension,
  updateBendingTemplateImage,
  deleteBendingTemplate
} from './bending.controller';
import { upload } from '../../../middleware/multer.middleware';

const router = Router();

/* ======================================================
   PUBLIC ROUTES
====================================================== */

// Get all bending templates
router.get('/bending-templates', getBendingTemplates);

// Get single bending template by templateId
router.get('/template/:templateId', getSingleBendingTemplate);

/* ======================================================
   ADMIN ROUTES
====================================================== */

// Create new bending template
router.post('/admin/create', createBendingTemplate);

// Update entire bending template (no create)
router.put('/admin/update/:templateId', updateBendingTemplate);

// Update only one dimension (partial update)
router.patch('/admin/update-dimension', updateTemplateDimension);

// Update template image
router.patch(
  '/admin/update-image/:templateId',
  upload.any(),
  updateBendingTemplateImage
);

// Delete bending template
router.delete('/admin/delete/:templateId', deleteBendingTemplate);

export default router;
