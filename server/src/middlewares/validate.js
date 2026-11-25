import { AppError } from '../utils/AppError.js';

// Valida body, query y params con un esquema zod: z.object({ body, query, params })
// El resultado queda en req.valid (en Express 5 req.query es de solo lectura).
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body ?? {}, // en Express 5 req.body es undefined si no hay cuerpo
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.slice(1).join('.'),
      message: issue.message,
    }));
    throw new AppError(400, 'VALIDATION_ERROR', 'Datos inválidos', details);
  }

  req.valid = result.data;
  next();
};
