// src/hooks/useSaveQuote.ts
'use client'

import { toast } from 'sonner'
import { z }    from 'zod'
import { useCompanyStore } from '@/lib/store/useCompanyStore'

import { QuoteStatus, QuoteItem } from "@prisma/client";

export interface FormData {
  clientId:  number;            // ID del cliente
  companyId?: number;
  notes?: string;
  status?: QuoteStatus;
  items: QuoteItem[];
}


/* ------------------------- 1)  Esquema de validación ---------------------- */
//  – Si cambias algún campo en el formulario, actualízalo aquí también.
const ItemSchema = z.object({
  description: z.string().min(1, 'Descripción obligatoria'),
  unit:        z.string().min(1, 'Unidad obligatoria'),
  quantity:    z.number().positive('Cantidad > 0'),
  unitPrice:   z.number().nonnegative('Precio ≥ 0'),
})

const QuotePayloadSchema = z.object({
  clientId:  z.number(),
  notes:     z.string().optional(),
  status:    z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
  items:     z.array(ItemSchema).min(1, 'Debe haber al menos un ítem'),
})

export type QuotePayload = z.infer<typeof QuotePayloadSchema>

/* ------------------------- 2)  Hook principal ----------------------------- */
export function useSaveQuote() {
  const saveQuote = async (data: FormData) => {
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error?.error || "Error al guardar cotización");
        throw new Error(error?.error || "Error al guardar cotización");
      }

      const savedQuote = await res.json();
      toast.success("Cotización guardada correctamente");
      return savedQuote;
    } catch (error) {
      console.error("Error al guardar cotización:", error);
      toast.error("Error inesperado al guardar la cotización");
      throw error;
    }
  };

  return { saveQuote };
}