import { z } from 'zod';

/**
 * Esquema de validación para la pestaña "Redes" del formulario de empresa.
 */
export const socialSchema = z.object({
  facebookUrl: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith('http'), {
      message: 'La URL de Facebook debe comenzar con http',
    }),

  instagramUrl: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith('http'), {
      message: 'La URL de Instagram debe comenzar con http',
    }),

  tiktokUrl: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith('http'), {
      message: 'La URL de TikTok debe comenzar con http',
    }),
});

export type SocialSchema = z.infer<typeof socialSchema>;
