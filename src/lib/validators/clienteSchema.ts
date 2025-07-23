import { z } from 'zod'

export const clientSchema = z.object({
  documentType: z.enum(['DNI', 'RUC', 'CE'], {
    message: 'Selecciona un tipo de documento',
  }),
  documentNumber: z
    .string()
    .min(8, 'Debe tener al menos 8 caracteres')
    .max(15, 'Máximo 15 caracteres'),
  fullName: z.string().min(2, 'El nombre es obligatorio'),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export type ClientFormValues = z.infer<typeof clientSchema>
