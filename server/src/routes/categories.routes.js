import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { validate } from '../middlewares/validate.js';
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validators/categories.validators.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', listCategories);
router.post('/', requireRole('admin'), validate(createCategorySchema), createCategory);
router.put('/:id', requireRole('admin'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', requireRole('admin'), validate(categoryIdSchema), deleteCategory);

export default router;
