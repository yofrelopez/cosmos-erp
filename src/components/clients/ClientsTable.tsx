
'use client'

import { Eye, Pencil, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { usePaginatedList } from '@/hooks/usePaginatedList'
import SearchBar from '../common/SearchBar'
import AddClientModal from './AddClientModal'
import EditClientModal from './EditClientModal'
import ViewClientModal from './ViewClientModal'
import RowActions from '../common/RowActions'
import PaginatedTable from '../common/PaginatedTable'
import { Loader2 } from 'lucide-react'

export default function ClientsTable() {

  const [search, setSearch] = useState<string>('')


const {
  data: clients,
  totalItems,
  isLoading,
  error,
  currentPage,
  setPage,
  mutate,
} = usePaginatedList<any>({
  endpoint: '/api/clients',
  pageSize: 5,
  query: search,
})


  

  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const openViewModal = (client: any) => {
    setSelectedClient(client)
    setViewModalOpen(true)
  }

  const openEditModal = (client: any) => {
    setSelectedClient(client)
    setEditModalOpen(true)
  }

  const confirmDelete = (id: number) => {
    const toastId = toast.custom((t) => (
      <div className="bg-white shadow-md p-4 rounded-lg flex flex-col gap-3 border">
        <p className="font-medium text-gray-800">¿Estás seguro de eliminar este cliente?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(toastId)}
            className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              toast.dismiss(toastId)
              try {
                const res = await fetch(`/api/clients/${id}`, {
                  method: 'DELETE',
                })
                if (!res.ok) throw new Error()
                toast.success('Cliente eliminado')
                mutate()
              } catch {
                toast.error('No se pudo eliminar el cliente')
              }
            }}
            className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    ))
  }

  const pageSize = 5
  const tableHeaders = [
    '#',
    'Documento',
    'Nombre / Razón Social',
    'Teléfono',
    'Fecha',
    'Acciones',
  ]

  const tableRows = (clients ?? []).map((client: any, idx: number) => (
    <tr key={client.id} className="hover:bg-gray-50 even:bg-gray-50 border-b">
      <td className="px-4 py-3 text-gray-800">{(currentPage - 1) * pageSize + idx + 1}</td>
      <td className="px-4 py-3 text-gray-800">
        {client.documentType} {client.documentNumber}
      </td>
      <td className="px-4 py-3 text-gray-800">{client.fullName || client.businessName}</td>
      <td className="px-4 py-3 text-gray-800">{client.phone ?? '-'}</td>
      <td className="px-4 py-3 text-gray-800">
        {new Date(client.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-gray-800 flex justify-center gap-2">
        <RowActions
          actions={[
            {
              label: 'Ver',
              icon: Eye,
              onClick: () => openViewModal(client),
            },
            {
              label: 'Editar',
              icon: Pencil,
              onClick: () => openEditModal(client),
            },
            {
              label: 'Eliminar',
              icon: Trash,
              onClick: () => confirmDelete(client.id),
              variant: 'danger',
            },
          ]}
        />
      </td>
    </tr>
  ))

  if (error) {
    return <p className="text-red-500 text-center">Error al cargar clientes</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, DNI o RUC"
        />
        <AddClientModal onSuccess={() => mutate()} />
      </div>

      {isLoading && clients.length === 0 ? (
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

      {selectedClient && (
        <>
          <ViewClientModal
            client={selectedClient}
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
          />
          <EditClientModal
            client={selectedClient}
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSuccess={() => {
              mutate()
              setEditModalOpen(false)
            }}
          />
        </>
      )}
    </div>
  )
}