// src/components/quotes/QuoteTable.tsx
"use client";

import { useState } from "react";
import { Eye, Pencil, Trash, FileText, Plus, AlertTriangle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

import { usePaginatedList } from "@/hooks/usePaginatedList";
import PaginatedTable from "@/components/common/PaginatedTable";
import RowActions from "@/components/common/RowActions";
import SearchBar from "../common/SearchBar";
import ViewQuoteModal from "./ViewQuoteModal";
import { Quote, Client } from "@prisma/client";

import QuoteStatusBadge from "./QuoteStatusBadge";

import { useRouter } from 'next/navigation';   // ⬅️ nuevo
import { useDeleteQuote } from '@/hooks/useDeleteQuote';

import { Prisma } from "@prisma/client";


interface QuoteTableProps {
  fetchUrl: string;
}

type QuoteWithClient = Quote & {
  client: Client | null;
};

type QuoteWithClientAndItems = Prisma.QuoteGetPayload<{
  include: { 
    client: true, 
    items: { 
      include: { 
        images: true 
      } 
    } 
  };
}>;



export default function QuoteTable({ fetchUrl }: QuoteTableProps) {

  const router = useRouter();                  // ⬅️ nuevo
  const { deleteQuote, isDeleting } = useDeleteQuote();
  const [search, setSearch] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
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

  // Función para manejar eliminación con confirmación
  const handleDeleteQuote = (quote: QuoteWithClientAndItems) => {
    const clientName = quote.client?.fullName || quote.client?.businessName || 'Cliente desconocido';
    
    toast(`¿Eliminar cotización ${quote.code}?`, {
      description: `Esta acción eliminará permanentemente la cotización para ${clientName}. Total: S/ ${quote.total.toFixed(2)}`,
      action: {
        label: 'Sí, eliminar',
        onClick: async () => {
          try {
            setDeletingId(quote.id);
            await deleteQuote(quote.id);
            // Recargar la lista después de eliminar
            mutate();
          } catch (error) {
            // El error ya se maneja en el hook
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {
          // No hacer nada, solo cerrar
        },
      },
      duration: 15000, // 15 segundos para decidir
      icon: <AlertTriangle className="w-5 h-5" />,
    });
  };


  const tableRows = (quotes ?? []).map((quote: any, idx: number) => {
    const isBeingDeleted = deletingId === quote.id;
    
    return (
    <tr
      key={quote.id}
      className={clsx(
        "transition-all duration-200 border-b border-gray-200",
        isBeingDeleted 
          ? "bg-red-50 opacity-60" 
          : "hover:bg-gray-50"
      )}
    >
      <td className="px-4 py-4 text-sm text-gray-600">
        {(currentPage - 1) * pageSize + idx + 1}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isBeingDeleted 
              ? "bg-red-100" 
              : "bg-blue-100"
          )}>
            {isBeingDeleted ? (
              <Loader2 size={16} className="text-red-600 animate-spin" />
            ) : (
              <FileText size={16} className="text-blue-600" />
            )}
          </div>
          <span className={clsx(
            "font-medium",
            isBeingDeleted ? "text-red-600" : "text-gray-900"
          )}>
            {quote.code}
            {isBeingDeleted && (
              <span className="text-xs text-red-500 ml-2">(Eliminando...)</span>
            )}
          </span>
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
              onClick: () => router.push(`/admin/cotizaciones/${quote.id}/editar`),   // ⬅️ antes hacía console.log
            },
            {
              label: "Eliminar",
              icon: Trash,
              onClick: () => handleDeleteQuote(quote),
              variant: "danger",
              disabled: isBeingDeleted || isDeleting,
            },
          ]}
        />
      </td>
    </tr>
    );
  });

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
            href="/admin/cotizaciones/nueva"
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
