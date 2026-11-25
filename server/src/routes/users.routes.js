import { Router } from 'express';
import { createUser, listUsers, updateUser } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { validate } from '../middlewares/validate.js';
import { createUserSchema, updateUserSchema } from '../validators/users.validators.js';

const router = Router();

// Todo este módulo es solo para administradores
router.use(authenticate, requireRole('admin'));

router.get('/', listUsers);
router.post('/', validate(createUserSchema), createUser);
router.patch('/:id', validate(updateUserSchema), updateUser);

export default router;
