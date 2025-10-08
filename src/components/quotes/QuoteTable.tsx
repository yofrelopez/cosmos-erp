// src/components/quotes/QuoteTable.tsx
"use client";

import { useState } from "react";
import { Eye, Pencil, Trash, FileText, Plus } from "lucide-react";
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
const tableHeaders = ["#", "Cotización", "Estado", "Cliente", "Fecha", "Total", "Acciones"]

  const [selectedQuote, setSelectedQuote] = useState<QuoteWithClientAndItems | null>(null);


  const tableRows = (quotes ?? []).map((quote: any, idx: number) => (
    <tr
      key={quote.id}
      className="hover:bg-gray-50 transition-colors border-b border-gray-200"
    >
      <td className="px-4 py-4 text-sm text-gray-600">
        {(currentPage - 1) * pageSize + idx + 1}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText size={16} className="text-blue-600" />
          </div>
          <span className="font-medium text-gray-900">{quote.code}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <QuoteStatusBadge status={quote.status} />
      </td>
      <td className="px-4 py-4">
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {quote.client?.fullName || quote.client?.businessName || "Sin cliente"}
          </div>
          {quote.client?.documentNumber && (
            <div className="text-gray-500">
              {quote.client.documentNumber}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">
        {new Date(quote.createdAt).toLocaleDateString('es-PE')}
      </td>
      <td className="px-4 py-4">
        <span className="font-semibold text-green-600">
          S/ {quote.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
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
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
        <p className="text-red-500">No se pudieron cargar las cotizaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con buscador */}
      <div className="p-6">
        <SearchBar
          placeholder="Buscar por cliente, documento o código de cotización..."
          value={search}
          onChange={setSearch}
        />
      </div>

      {/* Contenido */}
      {isLoading && quotes.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Cargando cotizaciones...</span>
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cotizaciones registradas</h3>
          <p className="text-gray-500 mb-6">
            {search ? 
              `No se encontraron cotizaciones que coincidan con "${search}".` :
              'Comienza creando tu primera cotización para un cliente.'
            }
          </p>
          <a 
            href="/cotizaciones/nueva"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Nueva Cotización
          </a>
        </div>
      ) : (
        <div className="overflow-hidden">
          <PaginatedTable
            headers={tableHeaders}
            rows={tableRows}
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
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
