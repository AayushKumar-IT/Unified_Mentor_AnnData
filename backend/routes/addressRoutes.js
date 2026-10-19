import { Router } from 'express';
import { getSavedAddresses } from '../controllers/addressController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', protect, authorize('consumer'), getSavedAddresses);
export default router;
