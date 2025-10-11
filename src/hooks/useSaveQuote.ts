// src/hooks/useSaveQuote.ts
'use client'

import { useState } from 'react'
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveQuote = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validar datos antes de enviar
      console.log('🔍 Validating quote data:', data);
      
      if (!data.clientId) {
        toast.error("ID de cliente es requerido");
        throw new Error("ID de cliente es requerido");
      }
      
      if (!data.companyId) {
        toast.error("ID de empresa es requerido");
        throw new Error("ID de empresa es requerido");
      }
      
      if (!data.items || data.items.length === 0) {
        toast.error("Debe haber al menos un item en la cotización");
        throw new Error("Debe haber al menos un item en la cotización");
      }

      // Limpiar y validar items
      const validatedItems = data.items.map((item, index) => {
        console.log(`🔍 Validating item ${index + 1}:`, item);
        
        if (!item.description || item.description.trim() === '') {
          throw new Error(`Item ${index + 1}: Descripción es requerida`);
        }
        
        if (!item.unit || item.unit.trim() === '') {
          throw new Error(`Item ${index + 1}: Unidad es requerida`);
        }
        
        const quantity = Number(item.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Item ${index + 1}: Cantidad debe ser un número mayor a 0`);
        }
        
        const unitPrice = Number(item.unitPrice);
        if (isNaN(unitPrice) || unitPrice < 0) {
          throw new Error(`Item ${index + 1}: Precio unitario debe ser un número mayor o igual a 0`);
        }

        return {
          description: item.description.trim(),
          unit: item.unit.trim(),
          quantity: quantity,
          unitPrice: unitPrice
        };
      });

      const payload = {
        clientId: Number(data.clientId),
        companyId: Number(data.companyId),
        notes: data.notes || '',
        status: data.status || 'PENDING',
        items: validatedItems
      };

      console.log('📤 Sending quote payload:', payload);

      const res = await fetch("/api/quotes", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ API Error Response:', errorData);
        
        let errorMessage = "Error al guardar cotización";
        if (errorData?.error) {
          errorMessage = errorData.error;
        }
        if (errorData?.issues && Array.isArray(errorData.issues)) {
          errorMessage += ": " + errorData.issues.map((issue: any) => issue.message).join(", ");
        }
        
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const savedQuote = await res.json();
      console.log('✅ Quote saved successfully:', savedQuote);
      toast.success("Cotización guardada correctamente");
      return savedQuote;
    } catch (error) {
      console.error("❌ Error al guardar cotización:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Error inesperado al guardar la cotización";
      setError(errorMessage);
      toast.error(errorMessage);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    saveQuote, 
    isLoading, 
    error,
    clearError: () => setError(null)
  };
}