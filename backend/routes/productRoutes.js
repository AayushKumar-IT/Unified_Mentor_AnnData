import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { addProduct, deleteProduct, farmerProducts, getMyProduct, getProduct, listProducts, myProducts, updateProduct } from '../controllers/productController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();
const uploadDir = fileURLToPath(new URL('../uploads/', import.meta.url));
mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) return callback(new Error('Only JPEG, PNG, WebP and GIF images are allowed'));
    callback(null, true);
  }
});

router.get('/', listProducts);
router.get('/mine', protect, authorize('farmer'), myProducts);
router.get('/mine/:id', protect, authorize('farmer'), getMyProduct);
router.get('/farmer/:farmerId', farmerProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('farmer'), upload.array('images', 5), addProduct);
router.put('/:id', protect, authorize('farmer'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('farmer'), deleteProduct);
export default router;
