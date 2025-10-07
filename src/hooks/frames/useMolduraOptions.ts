"use client";

import * as React from "react";

type Option = { id: number; name: string };

type Result = {
  moldings: Option[];
  thicknesses: Option[];
  matboards: Option[];
  backings: Option[];
  accessories: Option[];
  loading: boolean;
  error: string | null;
};

export function useMolduraOptions(companyId?: number): Result {
  const [state, setState] = React.useState<Result>({
    moldings: [], thicknesses: [], matboards: [], backings: [], accessories: [],
    loading: false, error: null,
  });

  React.useEffect(() => {
    if (!companyId) return;
    let cancel = false;

    (async () => {
      setState(s => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch(`/api/pricing/frames/options?companyId=${companyId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const moldings: Option[]   = (data?.moldings ?? []).map((m: any) => ({ id: m.id, name: m.name }));
        const thicknesses: Option[] = (data?.thickness?.moldura ?? []).map((t: any) => ({ id: t.id, name: t.name }));
        const matboards: Option[]  = (data?.matboards ?? []).map((x: any) => ({ id: x.id, name: x.name }));
        const backings: Option[]   = (data?.backings ?? []).map((x: any) => ({ id: x.id, name: x.name }));
        const accessories: Option[] = (data?.accessories ?? []).map((a: any) => ({ id: a.id, name: a.name }));

        if (!cancel) {
          setState({
            moldings, thicknesses, matboards, backings, accessories,
            loading: false, error: null,
          });
        }
      } catch (e: any) {
        if (!cancel) setState(s => ({ ...s, loading: false, error: e.message || "Error cargando opciones" }));
      }
    })();

    return () => { cancel = true; };
  }, [companyId]);

  return state;
}
