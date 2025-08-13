import { z } from 'zod';

export const bankAccountSchema = z.object({
  bank: z.string().min(2, 'El banco es obligatorio'),
  accountType: z.string().min(2, 'Tipo de cuenta obligatorio'),
  alias: z.string().max(50).optional(),
  number: z.string().min(5, 'Número de cuenta inválido'),
  cci: z.string().length(20, 'El CCI debe tener 20 dígitos').optional(),
  currency: z.enum(['PEN', 'USD'], {
    message: 'Moneda inválida',
  }),
  companyId: z.number().int().positive({ message: 'ID de empresa inválido' }),
});

export type BankAccountSchema = z.infer<typeof bankAccountSchema>;

