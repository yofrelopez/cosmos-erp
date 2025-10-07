"use client";

import * as React from "react";

type Option = { id: number; name: string };

export function useBastidorOptions(companyId?: number) {
  const [thicknesses, setThicknesses] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId) return;
    let cancel = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/pricing/frames/options?companyId=${companyId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // 🔑 tu endpoint expone thickness.bastidor
        const list = (data?.thickness?.bastidor ?? []);
        const opts: Option[] = list.map((t: any) => ({ id: t.id, name: t.name }));

        if (!cancel) setThicknesses(opts);
      } catch (e: any) {
        if (!cancel) setError(e.message || "Error cargando espesores");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [companyId]);

  return { thicknesses, loading, error };
}
