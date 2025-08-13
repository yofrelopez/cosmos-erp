import { z } from 'zod';

/**
 * Validación para crear / editar empresas.
 * ‑ Los campos opcionales aceptan string vacía, pero la limpiamos luego.
 */
export const companySchema = z.object({
  name:  z.string().min(3, 'Mínimo 3 caracteres'),
  ruc:   z.string().length(11, 'RUC debe tener 11 dígitos'),
logo: z.any().optional(),

  address: z.string().max(120).optional(),
  phone:   z.string().max(20).optional(),
  whatsapp:z.string().max(20).optional(),
  facebookUrl:  z.string().optional().refine((val) => !val || val.startsWith('http'), {
  message: 'URL inválida',
}),
  instagramUrl: z.string().optional().refine((val) => !val || val.startsWith('http'), {
  message: 'URL inválida',
}),
  tiktokUrl:    z.string().optional().refine((val) => !val || val.startsWith('http'), {
  message: 'URL inválida',
}),
  email: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
  message: 'Correo inválido',
}),
  website: z.string().optional().refine((val) => !val || val.startsWith('http'), {
  message: 'Debes comenzar con http:// o https://',
}),
  slogan:  z.string().max(100).optional(),
  description: z.string().max(300).optional(),
  notes:   z.string().max(300).optional(),
});

export type CompanySchema = z.infer<typeof companySchema>;
