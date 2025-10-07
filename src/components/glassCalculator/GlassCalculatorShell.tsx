"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import GlassForm from "./GlassForm";
import { useGlassItemsLocalStorage } from "@/hooks/useGlassItemsLocalStorage";
// 🔽 añade este import
import { useCompanyStore } from "@/lib/store/useCompanyStore";






type QuoteItemLite = {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type Props = {
  quoteId?: number;
  companyId?: number; // fallback solo para pruebas
};

export default function GlassCalculatorShell({ quoteId, companyId }: Props) {



  const companyFromStore = useCompanyStore((s) => s.company);

  // 🔎 resolvemos el companyId: prop > store
  const resolvedCompanyId = companyId ?? companyFromStore?.id;

  // 🛡️ si no hay empresa todavía (primera carga), muestra un estado amable
  if (!resolvedCompanyId) {
    return (
      <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
        Selecciona una empresa para usar la calculadora.
      </div>
    );
  }

  // 🔒 Hooks SIEMPRE al inicio (sin condicionales)
  const {
    items,
    setItems,
    clear,
    hydrated,
  } = useGlassItemsLocalStorage<QuoteItemLite>("quoteItems");

  const partialTotal = React.useMemo(
    () => Number(items.reduce((acc, it) => acc + (it.subtotal ?? 0), 0).toFixed(2)),
    [items]
  );

  const handleAddItem = React.useCallback(
    (it: QuoteItemLite) => setItems((prev) => [...prev, it]),
    [setItems]
  );

  // Render defensivo post-hidratación (sin mover hooks)
  if (!hydrated) return null;

  return (
    <div className="w-full px-4 py-6 md:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calculadora de Vidrios</h1>
          <p className="text-sm text-gray-500">
            Calcula múltiples piezas y agrégalas a la cotización {quoteId ? `#${quoteId}` : "actual"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="md" tone="neutral" variant="outline" action="cancel" onClick={clear}>
            <span className="hidden sm:inline">Limpiar</span>
            <span className="sr-only sm:not-sr-only sm:hidden">Limpiar</span>
          </Button>

          <Button
            size="md"
            tone="primary"
            variant="solid"
            action="save"
            disabled={items.length === 0}
            onClick={() => {
              // TODO: integrar con flujo de guardado real en la cotización
              alert("Próximo paso: enviar a la cotización seleccionada.");
            }}
          >
            <span className="hidden sm:inline">Agregar a cotización</span>
            <span className="sr-only sm:not-sr-only sm:hidden">Agregar todos</span>
          </Button>
        </div>
      </div>

      {/* Layout responsive */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Formulario */}
        <section className="lg:col-span-5">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-medium">Parámetros</h2>

            <GlassForm companyId={resolvedCompanyId} onAddItem={handleAddItem} />


          </div>
        </section>

        {/* Tabla temporal */}
        <section className="lg:col-span-7">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-medium">Resultados temporales</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b text-gray-500">
                  <tr>
                    <th className="py-2 pr-4">Descripción</th>
                    <th className="py-2 pr-4">Cant.</th>
                    <th className="py-2 pr-4">P. Unit.</th>
                    <th className="py-2 pr-4">Subtotal</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td className="py-6 text-gray-500" colSpan={5}>
                        No hay cálculos aún. Completa el formulario y presiona “Calcular y agregar”.
                      </td>
                    </tr>
                  ) : (
                    items.map((it, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-3 pr-4">{it.description}</td>
                        <td className="py-3 pr-4">{it.quantity}</td>
                        <td className="py-3 pr-4">S/. {it.unitPrice.toFixed(2)}</td>
                        <td className="py-3 pr-4 font-medium">S/. {it.subtotal.toFixed(2)}</td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            tone="danger"
                            variant="ghost"
                            action="delete"
                            aria-label="Eliminar ítem"
                            onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-end gap-4">
              <span className="text-sm text-gray-500">Total parcial</span>
              <span className="text-lg font-semibold">S/. {partialTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
