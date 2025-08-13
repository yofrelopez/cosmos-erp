import { z } from 'zod';

/**
 * Esquema de validación para la pestaña "Contacto" del formulario de empresa.
 */
export const contactSchema = z.object({
  phone: z
    .string()
    .max(20, 'Máximo 20 caracteres')
    .optional(),

  email: z
    .string()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Correo electrónico inválido',
    }),

  website: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith('http://') || val.startsWith('https://'), {
      message: 'Debes comenzar con http:// o https://',
    }),
});

export type ContactSchema = z.infer<typeof contactSchema>;
