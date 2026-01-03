import { Router } from 'express';
import { createTemplate, deleteTemplate, getTemplateById, getTemplates, updateFieldLabel, updateTemplate, updateTemplateImage } from './rebar.controller';
import { upload } from '../../../middleware/multer.middleware';


const router = Router();
router.post('/create',createTemplate)
router.get('/templates', getTemplates);
router.get('/templates/:templateId', getTemplateById);
router.patch('/update/templateId',updateTemplate)
router.patch(
  '/admin/update-image/:templateId', 
  upload.any(), // This "imageUrl" must match Postman key
  updateTemplateImage
);
router.patch('/update/:templateId',updateTemplate)
router.patch('/admin/update-label', updateFieldLabel);
router.delete('/delete/:templateId',deleteTemplate)

export default router;