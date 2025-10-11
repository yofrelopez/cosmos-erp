// src/hooks/useDeleteQuote.ts
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function useDeleteQuote() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteQuote = async (quoteId: number) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar cotización');
      }

      const result = await response.json();
      
      toast.success('Cotización eliminada exitosamente', {
        description: `La cotización ha sido eliminada permanentemente.`,
        duration: 3000,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      
      toast.error('Error al eliminar cotización', {
        description: errorMessage,
        duration: 4000,
      });
      
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteQuote,
    isDeleting,
    error,
    clearError: () => setError(null)
  };
}