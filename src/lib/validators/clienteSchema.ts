import { z } from 'zod';
import { DocumentType } from '@prisma/client';

/* 1️⃣  Enum de Zod sincronizado con el enum de Prisma */
const DocumentTypeSchema = z.enum(
  Object.values(DocumentType) as [DocumentType, ...DocumentType[]],
  { message: 'Selecciona un tipo de documento válido' }
);

/* 2️⃣  Esquema completo del cliente */
export const clientSchema = z.object({
  documentType: DocumentTypeSchema,
  documentNumber: z
    .string()
    .min(8, 'Debe tener al menos 8 caracteres')
    .max(15, 'Máximo 15 caracteres'),
  fullName: z.string().min(2, 'El nombre es obligatorio'),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.email('Correo inválido'), z.literal('')]).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),

  /* companyId ahora es obligatorio */
  companyId: z
    .number()
    .refine((val) => typeof val === 'number' && !isNaN(val), {
      message: 'El ID de empresa debe ser un número',
    }),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
