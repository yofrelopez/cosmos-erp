import { z } from 'zod';

export const quoteItemSchema = z.object({
  description: z.string().min(1),
  unit: z.string().optional().default(''),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
});

export const quoteCreateSchema = z.object({
  clientId: z.number().int().positive(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).default('PENDING'),
  items: z.array(quoteItemSchema).min(1, 'Debes agregar al menos un ítem'),
});
export type QuoteCreateInput = z.infer<typeof quoteCreateSchema>;
