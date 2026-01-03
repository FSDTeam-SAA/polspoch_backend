import { Router } from 'express';
import {
  getBendingTemplates,
  getSingleBendingTemplate,
  createBendingTemplate,
  updateBendingTemplate,
 
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
router.post('/admin/create',upload.any(), createBendingTemplate);

// Update entire bending template (no create)
router.patch('/admin/update/:templateId', upload.any(), updateBendingTemplate);





// Delete bending template
router.delete('/admin/delete/:templateId', deleteBendingTemplate);

export default router;
