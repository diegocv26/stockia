import { z } from 'zod';
import { emailField, idParams, nameField, passwordField } from './common.js';

const roleField = z.enum(['admin', 'seller'], { message: 'Rol inválido' });

export const createUserSchema = z.object({
  body: z.object({
    name: nameField,
    email: emailField,
    password: passwordField,
    role: roleField.default('seller'),
  }),
});

export const updateUserSchema = z.object({
  params: idParams,
  body: z
    .object({
      name: nameField.optional(),
      role: roleField.optional(),
      isActive: z.boolean().optional(),
      password: passwordField.optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'Envía al menos un campo para actualizar',
    }),
});
