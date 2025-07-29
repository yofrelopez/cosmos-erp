"use client";

import Link from "next/link";
import QuoteTable from "@/components/quotes/QuoteTable";
import { useCompanyStore } from "@/lib/store/useCompanyStore";

export default function QuotesPage() {
  const companyId = useCompanyStore((s) => s.company?.id);

  if (!companyId) {
    return (
      <p className="text-center py-10 text-gray-500">
        Selecciona una empresa para continuar.
      </p>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cotizaciones</h1>
        <Link href="/cotizaciones/nueva">
          <button className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
            + Nueva cotización
          </button>
        </Link>
      </div>

      <QuoteTable fetchUrl={`/api/quotes?companyId=${companyId}`} />
    </main>
  );
}
