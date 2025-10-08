import { z } from 'zod';

/**
 * Esquema de validación para la pestaña "General" del formulario de empresa.
 * Esta sección incluye los datos básicos de identidad y gestión.
 */
export const generalSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),

  ruc: z
    .string()
    .length(11, 'El RUC debe tener exactamente 11 dígitos')
    .regex(/^\d+$/, 'El RUC debe contener solo números'),

  address: z
    .string()
    .max(120, 'Dirección demasiado larga')
    .optional(),

  legalRepresentative: z
    .string()
    .max(100, 'Máximo 100 caracteres')
    .optional(),

  administrator: z
    .string()
    .max(100, 'Máximo 100 caracteres')
    .optional(),

  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
    error: 'Debes seleccionar un estado',
  }),

  slogan: z
    .string()
    .max(100, 'Eslogan demasiado largo')
    .optional(),

  description: z
    .string()
    .max(300, 'Descripción demasiado larga')
    .optional(),

  notes: z
    .string()
    .max(300, 'Notas demasiado largas')
    .optional(),
});

export type GeneralSchema = z.infer<typeof generalSchema>;
