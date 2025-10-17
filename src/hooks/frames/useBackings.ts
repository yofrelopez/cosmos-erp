"use client";

import * as React from "react";

// Hook para obtener fondos del calculador de marcos
// Usa la API de matboards (/api/pricing/matboards) que corresponde 
// a la tabla que está en /admin/precios/fondos
type Backing = {
  id: number;
  name: string;
  pricePerFt2: number;
};

export function useBackings(companyId?: number) {
  const [backings, setBackings] = React.useState<Backing[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId) return;
    
    let cancel = false;
    
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Usar la API de matboards (fondos) en lugar de backings
        const res = await fetch(`/api/pricing/matboards?companyId=${companyId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data: Backing[] = await res.json();
        
        if (!cancel) {
          // Si no hay datos, usar fondos por defecto
          if (data.length === 0) {
            const defaultBackings: Backing[] = [
              { id: 999001, name: 'MDF', pricePerFt2: 0.5 },
              { id: 999002, name: 'Cartón Corrugado', pricePerFt2: 0.2 },
              { id: 999003, name: 'Foam Board', pricePerFt2: 0.8 },
              { id: 999004, name: 'Canvas', pricePerFt2: 1.2 }
            ];
            setBackings(defaultBackings);
          } else {
            setBackings(data);
          }
        }
      } catch (e: any) {
        if (!cancel) {
          setError(e.message || "Error cargando fondos");
        }
      } finally {
        if (!cancel) {
          setLoading(false);
        }
      }
    })();
    
    return () => { 
      cancel = true; 
    };
  }, [companyId]);

  return { backings, loading, error };
}