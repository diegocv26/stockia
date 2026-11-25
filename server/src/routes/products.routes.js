import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { validate } from '../middlewares/validate.js';
import { uploadSingleImage } from '../middlewares/upload.js';
import {
  productIdSchema,
  listProductsSchema,
  lowStockSchema,
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
} from '../validators/products.validators.js';
import {
  listProducts,
  listLowStock,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  adjustStock,
} from '../controllers/products.controller.js';

const router = Router();

router.use(authenticate);

// Lectura: admin y seller
router.get('/', validate(listProductsSchema), listProducts);
router.get('/low-stock', validate(lowStockSchema), listLowStock); // antes de /:id
router.get('/:id', validate(productIdSchema), getProduct);

// Escritura: solo admin (multer va antes de validate para que req.body ya exista)
router.post('/', requireRole('admin'), uploadSingleImage('image'), validate(createProductSchema), createProduct);
router.put('/:id', requireRole('admin'), uploadSingleImage('image'), validate(updateProductSchema), updateProduct);
router.post('/:id/adjust-stock', requireRole('admin'), validate(adjustStockSchema), adjustStock);
router.delete('/:id', requireRole('admin'), validate(productIdSchema), deleteProduct);
router.patch('/:id/restore', requireRole('admin'), validate(productIdSchema), restoreProduct);

export default router;
