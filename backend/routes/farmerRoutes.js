import { Router } from 'express';
import { createProfile, getFarmer, getMyProfile, listFarmers, salesSummary, updateProfile } from '../controllers/farmerController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', listFarmers);
router.get('/profile', protect, authorize('farmer'), getMyProfile);
router.post('/profile', protect, authorize('farmer'), createProfile);
router.put('/profile', protect, authorize('farmer'), updateProfile);
router.get('/sales-summary', protect, authorize('farmer'), salesSummary);
router.get('/:id', getFarmer);
export default router;
