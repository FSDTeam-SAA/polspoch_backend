import { Router } from 'express';
import { getAllPolicies, getPolicyByName, updatePolicy } from './shipping.controller';
import { calculateBendingQuote, calculateCuttingQuote, calculateRebarQuote } from './calcaulation.controller';

const router = Router();

// Get all for the admin dashboard
router.get('/all',getAllPolicies);

// Get specific (e.g., /api/shipping/courier)
router.get('/:methodName', getPolicyByName);

// Update specific (e.g., /api/shipping/truck)
router.patch('/:methodName', updatePolicy);

router.post('/calculate-rebar',calculateRebarQuote)
router.post('/calculate-bending',calculateBendingQuote)
router.post('/calculate-cutting',calculateCuttingQuote)
export default router;