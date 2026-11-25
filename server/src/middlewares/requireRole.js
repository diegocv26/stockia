import { AppError } from '../utils/AppError.js';

// Uso: router.get('/', authenticate, requireRole('admin'), handler)
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción');
    }
    next();
  };
