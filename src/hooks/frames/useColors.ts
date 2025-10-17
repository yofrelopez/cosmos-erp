"use client";

import * as React from "react";

// Hook para obtener colores del calculador de marcos
// Usa la API de colores de molduras (/api/pricing/molding-colors) que corresponde 
// a la tabla que está en /admin/precios/colores
type MoldingColor = {
  id: number;
  name: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
};

export function useColors(companyId?: number) {
  const [colors, setColors] = React.useState<MoldingColor[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId) return;
    
    let cancel = false;
    
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/pricing/molding-colors?companyId=${companyId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data: MoldingColor[] = await res.json();
        
        if (!cancel) {
          // Si no hay datos, usar colores por defecto
          if (data.length === 0) {
            const defaultColors: MoldingColor[] = [
              { id: 999001, name: 'Blanco', companyId: companyId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { id: 999002, name: 'Negro', companyId: companyId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { id: 999003, name: 'Crema', companyId: companyId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { id: 999004, name: 'Gris', companyId: companyId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { id: 999005, name: 'Beige', companyId: companyId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            ];
            setColors(defaultColors);
          } else {
            setColors(data);
          }
        }
      } catch (e: any) {
        if (!cancel) {
          setError(e.message || "Error cargando colores");
          // En caso de error, usar colores por defecto
          const defaultColors: MoldingColor[] = [
            { id: 999001, name: 'Blanco', companyId: companyId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 999002, name: 'Negro', companyId: companyId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 999003, name: 'Crema', companyId: companyId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 999004, name: 'Gris', companyId: companyId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 999005, name: 'Beige', companyId: companyId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ];
          setColors(defaultColors);
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

  return { colors, loading, error };
}