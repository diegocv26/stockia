import { z } from 'zod';

const idParams = z.object({ id: z.coerce.number().int().positive() });

const name = z
  .string()
  .trim()
  .min(1, 'El nombre es obligatorio')
  .max(60, 'Máximo 60 caracteres');

export const categoryIdSchema = z.object({ params: idParams });
export const createCategorySchema = z.object({ body: z.object({ name }) });
export const updateCategorySchema = z.object({ params: idParams, body: z.object({ name }) });
