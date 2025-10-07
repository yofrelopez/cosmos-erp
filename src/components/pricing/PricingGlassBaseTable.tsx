// src/components/pricing/PricingGlassBaseTable.tsx
'use client'

import { useEffect, useState } from 'react'
import { Eye, Pencil, Trash } from 'lucide-react'
import { toast } from 'sonner'

import SearchBar from '@/components/common/SearchBar'
import PaginatedTable from '@/components/common/PaginatedTable'
import RowActions from '@/components/common/RowActions'
import AddPricingGlassBaseModal from '@/components/pricing/AddPricingGlassBaseModal'
import EditPricingGlassBaseModal from '@/components/pricing/EditPricingGlassBaseModal'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { useCompanyStore } from '@/lib/store/useCompanyStore'

type Item = {
  id: number
  companyId: number
  family: string
  thicknessMM: string        // Prisma Decimal → string
  pricePerFt2: string        // Prisma Decimal → string
  minBillableFt2?: string | null
  minCharge?: string | null
  validFrom: string
  validTo?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const PAGE_SIZE = 10

export default function PricingGlassBaseTable() {
  const { company } = useCompanyStore()
  const [search, setSearch] = useState('')
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // ⚠️ Este hook añade companyId, page, pageSize y search a la URL
  const {
    data: items,
    totalItems,
    isLoading,
    error,
    currentPage,
    setPage,
    mutate,
  } = usePaginatedList<Item>({
    endpoint: '/api/pricing/pricing-glass-base',
    pageSize: PAGE_SIZE,
    query: search,
  })

  // Reset de página al cambiar búsqueda
  useEffect(() => {
    setPage(1)
  }, [search, setPage])

  const headers = ['#', 'Familia', 'Espesor (mm)', 'Precio (ft²)', 'Vigente desde', 'Activo', 'Acciones']

  const rows = (items ?? []).map((it, idx) => (
    <tr key={it.id} className="hover:bg-gray-50 even:bg-gray-50 border-b">
      <td className="px-4 py-3">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
      <td className="px-4 py-3">{it.family}</td>
      <td className="px-4 py-3">{fmtNumber(it.thicknessMM)}</td>
      <td className="px-4 py-3">{fmtCurrency(it.pricePerFt2)}</td>
      <td className="px-4 py-3">{fmtDate(it.validFrom)}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold
          ${it.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}
        >
          {it.isActive ? 'Sí' : 'No'}
        </span>
      </td>
      <td className="px-4 py-3">
        <RowActions
          size="sm"
          actions={[
            { label: 'Ver', icon: Eye, onClick: () => toast.info('Vista rápida pendiente') },
            {
              label: 'Editar',
              icon: Pencil,
              onClick: () => {
                setSelectedId(it.id)
                setOpenEdit(true)
              },
            },
            {
              label: 'Eliminar',
              icon: Trash,
              variant: 'danger',
              onClick: () => handleDelete(it.id),
            },
          ]}
        />
      </td>
    </tr>
  ))

  async function handleDelete(id: number) {
    const ok = confirm('¿Eliminar este precio base?')
    if (!ok) return
    try {
      const res = await fetch(`/api/pricing/pricing-glass-base/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Precio eliminado')
      mutate()
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  if (!company) return <p className="text-gray-500">Selecciona una empresa para ver los precios.</p>
  if (error) return <p className="text-red-600">Error al cargar precios.</p>

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por familia (PLANO, TEMPLADO…) o espesor (ej. 5.5)"
        />
        <AddPricingGlassBaseModal onSuccess={mutate} />
      </div>

      {/* Tabla */}
      <PaginatedTable
        headers={headers}
        rows={isLoading ? [<LoadingRow key="loading" colSpan={headers.length} />] : rows}
        currentPage={currentPage}
        totalItems={totalItems ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Modal edición */}
      {selectedId !== null && (
        <EditPricingGlassBaseModal
          itemId={selectedId}
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onSuccess={() => {
            setOpenEdit(false)
            mutate()
          }}
        />
      )}
    </div>
  )
}

/* ---------------- helpers ---------------- */
function LoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-gray-500">
        Cargando…
      </td>
    </tr>
  )
}
function fmtDate(v: string) {
  const d = new Date(v)
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString('es-PE') : '—'
}
function fmtNumber(v: string | number) {
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n.toString().replace('.', ',') : String(v)
}
function fmtCurrency(v: string | number) {
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n)
    ? n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 })
    : String(v)
}
