import { z } from 'zod';

// Mensajes de validación en español
z.config(z.locales.es());
z.config({
  customError: (issue) => {
    if (issue.code === 'invalid_type' && issue.input === undefined) return 'Este campo es obligatorio';
    return undefined; // para el resto se usa el idioma configurado arriba
  },
});
