import { z } from 'zod';

export const emailField = z.string().trim().toLowerCase().email('Correo inválido');

export const passwordField = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede superar 72 caracteres');

export const nameField = z
  .string()
  .trim()
  .min(2, 'El nombre es muy corto')
  .max(100, 'El nombre es muy largo');

export const idParams = z.object({
  id: z.coerce.number().int().positive('Id inválido'),
});
