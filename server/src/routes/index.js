import { Router } from 'express';
import { query } from '../config/db.js';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();

// Ligero: no toca la BD. Úsalo para el ping que mantiene despierto el servicio en Render.
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() });
});

// Comprueba la conexión a la BD (despierta Neon si estaba suspendida)
router.get('/health/db', async (_req, res) => {
  await query('SELECT 1');
  res.json({ status: 'ok', database: 'connected' });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

export default router;
