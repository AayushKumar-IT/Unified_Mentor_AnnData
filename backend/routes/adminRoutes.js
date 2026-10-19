import { Router } from 'express';
import { analytics, categories, createCategory, deleteCategory, listAdminConsumers, listAdminFarmers, listAdminOrders, pendingFarmers, reviewFarmer } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/categories', categories);
router.use(protect, authorize('admin'));
router.get('/farmers', listAdminFarmers);
router.get('/farmers/pending', pendingFarmers);
router.patch('/farmers/:id/approve', reviewFarmer);
router.get('/consumers', listAdminConsumers);
router.get('/orders', listAdminOrders);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/analytics', analytics);
export default router;
