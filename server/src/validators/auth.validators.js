import { z } from 'zod';
import { emailField, nameField, passwordField } from './common.js';

export const registerSchema = z.object({
  body: z.object({
    storeName: z
      .string()
      .trim()
      .min(2, 'El nombre de la tienda es muy corto')
      .max(120, 'El nombre de la tienda es muy largo'),
    name: nameField,
    email: emailField,
    password: passwordField,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: z.string().min(1, 'Ingresa tu contraseña'),
  }),
});
