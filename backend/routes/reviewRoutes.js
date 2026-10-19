import { Router } from 'express';
import { createReview, farmerReviews, productReviews } from '../controllers/reviewController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/', protect, authorize('consumer'), createReview);
router.get('/product/:productId', productReviews);
router.get('/farmer/:farmerId', farmerReviews);
export default router;
