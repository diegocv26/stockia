import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Mensajes amigables según la restricción UNIQUE violada en Postgres
const CONSTRAINT_MESSAGES = {
  users_email_key: 'Ese correo ya está registrado',
  uq_products_store_sku: 'Ya existe un producto con ese SKU',
  categories_store_id_name_key: 'Ya existe una categoría con ese nombre',
  customers_store_id_cedula_key: 'Ya existe un cliente con esa cédula',
  cash_closures_store_id_closure_date_key: 'Ya existe un cierre de caja para esa fecha',
};

function normalizeError(err) {
  if (err instanceof AppError) return err;

  // Errores de body-parser
  if (err.type === 'entity.parse.failed') {
    return new AppError(400, 'INVALID_JSON', 'El cuerpo de la petición no es un JSON válido');
  }
  if (err.type === 'entity.too.large') {
    return new AppError(413, 'PAYLOAD_TOO_LARGE', 'La petición es demasiado grande');
  }

  // Errores de Postgres (el código SQLSTATE viene en err.code)
  switch (err.code) {
    case '23505':
      return new AppError(
        409,
        'DUPLICATE',
        CONSTRAINT_MESSAGES[err.constraint] || 'Ya existe un registro con esos datos'
      );
    case '23503':
      return new AppError(409, 'RELATED_DATA', 'La operación no se puede completar por datos relacionados');
    case '23514':
      return new AppError(400, 'CHECK_VIOLATION', 'Los datos no cumplen las reglas del sistema');
    case '22P02':
      return new AppError(400, 'INVALID_FORMAT', 'Formato de datos inválido');
    default:
      return err;
  }
}

export function notFound(req, _res, next) {
  next(new AppError(404, 'NOT_FOUND', `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Respuesta de error uniforme: { error: { code, message, details? } }
export function errorHandler(err, _req, res, next) {
  if (res.headersSent) return next(err);

  const error = normalizeError(err);
  const isKnown = error instanceof AppError;
  if (!isKnown) console.error(err);

  res.status(isKnown ? error.statusCode : 500).json({
    error: {
      code: isKnown ? error.code : 'INTERNAL_ERROR',
      message: isKnown || !env.isProd ? error.message : 'Error interno del servidor',
      ...(isKnown && error.details ? { details: error.details } : {}),
    },
  });
}
