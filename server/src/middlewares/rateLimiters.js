import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

const tooMany = (message) => ({ error: { code: 'TOO_MANY_REQUESTS', message } });

// Solo cuentan los intentos fallidos de login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isProd ? 10 : 1000,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooMany('Demasiados intentos fallidos. Intenta de nuevo en 15 minutos'),
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.isProd ? 10 : 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooMany('Demasiados registros desde esta conexión. Intenta más tarde'),
});
