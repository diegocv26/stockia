import { z } from 'zod';

// ---------- helpers (los campos multipart llegan siempre como string) ----------
const idParams = z.object({ id: z.coerce.number().int().positive() });

const round2 = (n) => Math.round(n * 100) / 100;

const money = (label) =>
  z.coerce
    .number({ error: `${label} debe ser un número` })
    .min(0, `${label} no puede ser negativo`)
    .max(9_999_999_999.99, `${label} es demasiado grande`)
    .transform(round2);

const wholeNumber = (label, max = 2_000_000_000) =>
  z.coerce
    .number({ error: `${label} debe ser un número` })
    .int(`${label} debe ser un número entero`)
    .min(0, `${label} no puede ser negativo`)
    .max(max, `${label} es demasiado grande`);

// '' y null -> null (borra el valor); undefined -> undefined (no tocar)
const nullish = (v) => (v === undefined ? undefined : v === '' || v === null ? null : v);

const nullableText = (max) =>
  z.string().trim().max(max, `Máximo ${max} caracteres`).nullable().optional().transform(nullish);

const categoryId = z
  .union([z.literal(''), z.null(), z.coerce.number().int().positive()])
  .optional()
  .transform(nullish);

const boolish = z.union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')]);

const name = z.string().trim().min(1, 'El nombre es obligatorio').max(120, 'Máximo 120 caracteres');

// ---------- esquemas ----------
export const productIdSchema = z.object({ params: idParams });

export const listProductsSchema = z.object({
  query: z.object({
    search: z.string().trim().max(100).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    lowStock: boolish.optional(),
    active: z.enum(['true', 'false', 'all']).default('true'),
    sort: z.enum(['name', 'price', 'stock', 'best_selling']).default('name'),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const lowStockSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name,
    sku: nullableText(50),
    description: nullableText(1000),
    categoryId,
    priceUsd: money('El precio'),
    costUsd: money('El costo').default(0),
    stock: wholeNumber('El stock').default(0),
    minStock: wholeNumber('El stock mínimo').default(5),
  }),
});

export const updateProductSchema = z.object({
  params: idParams,
  body: z.object({
    name: name.optional(),
    sku: nullableText(50),
    description: nullableText(1000),
    categoryId,
    priceUsd: money('El precio').optional(),
    costUsd: money('El costo').optional(),
    minStock: wholeNumber('El stock mínimo').optional(),
    removeImage: boolish.optional(),
  }),
});

export const adjustStockSchema = z.object({
  params: idParams,
  body: z.object({
    quantity: z.coerce
      .number({ error: 'La cantidad debe ser un número' })
      .int('La cantidad debe ser un número entero')
      .refine((n) => n !== 0, 'La cantidad no puede ser 0')
      .refine((n) => Math.abs(n) <= 1_000_000, 'La cantidad es demasiado grande'),
    note: z.string().trim().min(1, 'Indica el motivo del ajuste').max(200, 'Máximo 200 caracteres'),
  }),
});
