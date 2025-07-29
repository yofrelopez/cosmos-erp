// src/components/quotes/QuoteTable.tsx
"use client";

import { useState } from "react";
import { Eye, Pencil, Trash } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { usePaginatedList } from "@/hooks/usePaginatedList";
import PaginatedTable from "@/components/common/PaginatedTable";
import RowActions from "@/components/common/RowActions";
import SearchBar from "../common/SearchBar";
import ViewQuoteModal from "./ViewQuoteModal";
import { Quote, Client } from "@prisma/client";

import QuoteStatusBadge from "./QuoteStatusBadge";

import { useRouter } from 'next/navigation';   // ⬅️ nuevo

import { Prisma } from "@prisma/client";


interface QuoteTableProps {
  fetchUrl: string;
}

type QuoteWithClient = Quote & {
  client: Client | null;
};

type QuoteWithClientAndItems = Prisma.QuoteGetPayload<{
  include: { client: true, items: true };
}>;



export default function QuoteTable({ fetchUrl }: QuoteTableProps) {

  const router = useRouter();                  // ⬅️ nuevo
  const [search, setSearch] = useState<string>("");
  const pageSize = 5;

  // Hook reutilizable (mismo patrón que ClientsTable)
  const {
    data: quotes,
    totalItems,
    isLoading,
    error,
    currentPage,
    setPage,
    mutate,
  } = usePaginatedList<QuoteWithClientAndItems>({
    endpoint: fetchUrl,
    pageSize,
    query: search,
  });

  /* -------------------- Columnas y filas -------------------- */
const tableHeaders = ["#", "Código", "Estado", "Cliente", "Documento", "Fecha", "Total", "Acciones"]

  const [selectedQuote, setSelectedQuote] = useState<QuoteWithClientAndItems | null>(null);


  const tableRows = (quotes ?? []).map((quote: any, idx: number) => (
    <tr
      key={quote.id}
      className="hover:bg-gray-50 even:bg-gray-50 border-b"
    >
      <td className="px-4 py-3 text-gray-800">
        {(currentPage - 1) * pageSize + idx + 1}
      </td>
      <td className="px-4 py-3 text-gray-800">{quote.code}</td>
      <td className="px-4 py-3"><QuoteStatusBadge status={quote.status} /></td>
      <td className="px-4 py-3 text-gray-800">
        {quote.client?.fullName || quote.client?.businessName || "-"}
      </td>
      <td className="px-4 py-3 text-gray-800">
        {quote.client?.documentNumber || "-"}
      </td>
      <td className="px-4 py-3 text-gray-800">
        {new Date(quote.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-gray-800">S/ {quote.total.toFixed(2)}</td>
      <td className="px-4 py-3 text-gray-800 flex justify-center gap-2">
        <RowActions
          actions={[
            {
              label: "Ver",
              icon: Eye,
              onClick: async () => {
                try {
                  const res = await fetch(`/api/quotes/${quote.id}`)
                  if (!res.ok) throw new Error('No encontrada')
                  const fullQuote: QuoteWithClientAndItems = await res.json();

                  setSelectedQuote(fullQuote)
                } catch (err) {
                  toast.error('No se pudo obtener la cotización')
                }
              },
            },
            {
              label: "Editar",
              icon: Pencil,
              onClick: () => router.push(`/cotizaciones/${quote.id}/editar`),   // ⬅️ antes hacía console.log
            },
            {
              label: "Eliminar",
              icon: Trash,
              onClick: () => console.log("Eliminar", quote.id),
              variant: "danger",
            },
          ]}
        />
      </td>
    </tr>
  ));

  /* -------------------- Render -------------------- */
  if (error) {
    return (
      <p className="text-red-500 text-center">Error al cargar cotizaciones</p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Buscador simple */}

        <SearchBar
            placeholder="Buscar por cliente o documento..."
            value={search}
            onChange={setSearch}
          />
      
      

      {isLoading && quotes.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
        </div>
      ) : (
        <PaginatedTable
          headers={tableHeaders}
          rows={tableRows}
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
      {selectedQuote && (
        <ViewQuoteModal
          quote={selectedQuote}
          open={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />
      )}
    </div>
  );
}
