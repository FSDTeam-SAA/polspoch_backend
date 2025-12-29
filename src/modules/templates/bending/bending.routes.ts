import { Router } from 'express';
import { 
  getbendingTemplates, 
  updateTemplateData, 
  updateTemplateImage 
} from './bending.controller';
import { upload } from '../../../middleware/multer.middleware';

const router = Router();

/**
 * PUBLIC ROUTES
 * Use these to fetch the templates for the website/app
 */

// Get all templates where type is 'bending'
router.get('/bending-templates', getbendingTemplates);


/**
 * ADMIN ROUTES
 * Use these to manage the templates, dimensions, and images
 */

// Update template details (Change ranges for Size A, B, C or change the shape name)
// Example: PATCH /api/bending/admin/update-template/template-l
router.patch(
  '/update-template', 
  updateTemplateData
);

// Update specific template image
// Example: PATCH /api/bending/admin/update-image/template-l
// Note: 'imageUrl' should be the key in your Postman / Form-data
router.patch(
  '/admin/update-image/:templateId', 
  upload.any(), 
  updateTemplateImage
);

export default router;