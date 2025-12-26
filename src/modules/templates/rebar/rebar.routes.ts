import { Router } from 'express';
import { getTemplateById, getTemplates, updateFieldLabel, updateTemplateImage } from './rebar.controller';
import { upload } from '../../../middleware/multer.middleware';


const router = Router();

router.get('/templates', getTemplates);
router.get('/templates/:templateId', getTemplateById);
router.patch(
  '/admin/update-image/:templateId', 
  upload.any(), // This "imageUrl" must match Postman key
  updateTemplateImage
);
router.patch('/admin/update-label', updateFieldLabel);

export default router;