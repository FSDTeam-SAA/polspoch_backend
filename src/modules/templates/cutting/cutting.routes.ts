import { Router } from 'express';
import { 
  getCuttingTemplates, 
  updateCuttingTemplateData, 
  createCuttingTemplate,
  deleteCuttingTemplate
} from './cutting.controller';
import { upload } from '../../../middleware/multer.middleware';
// Assuming you use multer for file parsing

const router = Router();

// --- PUBLIC ROUTES ---

/**
 * @route   GET /api/cutting
 * @desc    Get all active cutting templates (Rectangle, Circle, etc.)
 */
router.get('/', getCuttingTemplates);


// --- ADMIN ROUTES ---

/**
 * @route   PATCH /api/cutting/update-data
 * @desc    Flexible update for top-level fields (cuts, shapeName) 
 * or nested dimension ranges (min/max)
 */
router.patch('/update-data/:templateId', upload.array('image', 1),updateCuttingTemplateData);


router.post('/create',upload.array('image', 1),createCuttingTemplate)

router.delete('/delete/:templateId',deleteCuttingTemplate)
export default router;