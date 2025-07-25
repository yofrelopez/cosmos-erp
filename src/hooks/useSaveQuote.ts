'use client';

import { toast } from 'sonner';
import { QuoteItem } from '@prisma/client';

interface SaveQuoteInput {
  clientId: string;
  items: QuoteItem[];
}
export function useSaveQuote() {
  const saveQuote = async (data: SaveQuoteInput) => {
    try {
      const preparedData = {
        clientId: Number(data.clientId),
        items: data.items.map((item) => ({
          ...item,
          subtotal: item.quantity * item.unitPrice,
        })),
      };

      console.log('📦 Enviando datos preparados:', preparedData);

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedData),
      });

      if (!res.ok) {
        throw new Error('No se pudo guardar la cotización');
      }

      toast.success('✅ Cotización guardada correctamente');
    } catch (error: any) {
      console.error('❌ Error al guardar la cotización:', error);
      toast.error('❌ Error al guardar la cotización');
    }
  };

  return { saveQuote };
}
