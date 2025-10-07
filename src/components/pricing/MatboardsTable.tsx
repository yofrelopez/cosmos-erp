'use client'

import { useState, useEffect } from 'react'
import { PricingMatboard } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import AddMatboardModal from './AddMatboardModal'
import EditMatboardModal from './EditMatboardModal'
import ViewMatboardModal from './ViewMatboardModal'

// Tipo para matboards con precio serializado
type SerializedMatboard = Omit<PricingMatboard, 'pricePerFt2'> & {
  pricePerFt2: number
}

interface Props {
  companyId: number
}

export default function MatboardsTable({ companyId }: Props) {
  const [matboards, setMatboards] = useState<SerializedMatboard[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMatboard, setEditingMatboard] = useState<SerializedMatboard | null>(null)
  const [viewingMatboard, setViewingMatboard] = useState<SerializedMatboard | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      refreshMatboards()
    }
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh data
  const refreshMatboards = async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      const res = await fetch(`/api/pricing/matboards?companyId=${companyId}`)
      if (res.ok) {
        const data = await res.json()
        setMatboards(data)
      }
    } catch (error) {
      console.error('Error refreshing matboards:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete with confirmation
  const handleDelete = async (matboard: SerializedMatboard) => {
    if (!companyId) return
    
    // Toast de confirmación
    toast(`¿Eliminar "${matboard.name}"?`, {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setDeletingId(matboard.id)
          try {
            const res = await fetch(`/api/pricing/matboards/${matboard.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyId })
            })

            if (res.ok) {
              toast.success('Fondo eliminado correctamente')
              refreshMatboards()
            } else {
              throw new Error('Error al eliminar')
            }
          } catch (error) {
            toast.error('Error al eliminar el fondo')
          } finally {
            setDeletingId(null)
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {
          // No hacer nada, solo cerrar el toast
        }
      }
    })
  }

  const getRowActions = (matboard: SerializedMatboard): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => setViewingMatboard(matboard),
      variant: 'default'
    },
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => setEditingMatboard(matboard),
      variant: 'default'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(matboard),
      variant: 'danger',
      disabled: deletingId === matboard.id
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus size={16} />
          Nuevo Fondo
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio por ft² (S/)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vigente desde
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Cargando fondos...
                </td>
              </tr>
            ) : matboards.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay fondos registrados
                </td>
              </tr>
            ) : (
              matboards.map((matboard) => (
                <tr key={matboard.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{matboard.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">S/ {matboard.pricePerFt2.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(matboard.validFrom).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      matboard.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {matboard.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <RowActions actions={getRowActions(matboard)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddMatboardModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            refreshMatboards()
          }}
          companyId={companyId}
        />
      )}

      {editingMatboard && (
        <EditMatboardModal
          open={!!editingMatboard}
          matboard={editingMatboard}
          onClose={() => setEditingMatboard(null)}
          onSuccess={() => {
            setEditingMatboard(null)
            refreshMatboards()
          }}
          companyId={companyId}
        />
      )}

      {viewingMatboard && (
        <ViewMatboardModal
          open={!!viewingMatboard}
          matboard={viewingMatboard}
          onClose={() => setViewingMatboard(null)}
        />
      )}
    </div>
  )
}