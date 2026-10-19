import { Router } from 'express';
import { farmerOrders, getOrder, myOrders, placeOrder, updateOrderStatus } from '../controllers/orderController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/', protect, authorize('consumer'), placeOrder);
router.get('/my-orders', protect, authorize('consumer'), myOrders);
router.get('/farmer-orders', protect, authorize('farmer'), farmerOrders);
router.patch('/:id/status', protect, authorize('farmer'), updateOrderStatus);
router.get('/:id', protect, getOrder);
export default router;
