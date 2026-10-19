import { Router } from 'express';
import { login, me, register, updatePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.put('/updatepassword', protect, updatePassword);
export default router;
