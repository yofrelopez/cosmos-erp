'use client'

import { useState, useEffect } from 'react'
import { PricingBacking } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import AddBackingModal from './AddBackingModal'
import EditBackingModal from './EditBackingModal'
import ViewBackingModal from './ViewBackingModal'


// Tipo para soportes con precio serializado
type SerializedBacking = Omit<PricingBacking, 'pricePerFt2'> & {
  pricePerFt2: number
}

interface Props {
  companyId: number
}

export default function BackingsTable({ companyId }: Props) {
  const [backings, setBackings] = useState<SerializedBacking[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBacking, setEditingBacking] = useState<SerializedBacking | null>(null)
  const [viewingBacking, setViewingBacking] = useState<SerializedBacking | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      refreshBackings()
    }
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh data
  const refreshBackings = async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      const res = await fetch(`/api/pricing/backings?companyId=${companyId}`)
      if (res.ok) {
        const data = await res.json()
        setBackings(data)
      }
    } catch (error) {
      console.error('Error refreshing backings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete with confirmation
  const handleDelete = async (backing: SerializedBacking) => {
    if (!companyId) return
    
    // Toast de confirmación
    toast(`¿Eliminar "${backing.name}"?`, {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setDeletingId(backing.id)
          try {
            const res = await fetch(`/api/pricing/backings/${backing.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyId })
            })

            if (res.ok) {
              toast.success('Soporte eliminado correctamente')
              refreshBackings()
            } else {
              throw new Error('Error al eliminar')
            }
          } catch (error) {
            toast.error('Error al eliminar el soporte')
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

  const getRowActions = (backing: SerializedBacking): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => setViewingBacking(backing),
      variant: 'default'
    },
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => setEditingBacking(backing),
      variant: 'default'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(backing),
      variant: 'danger',
      disabled: deletingId === backing.id
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus size={16} />
          Nuevo Soporte
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
                  Cargando soportes...
                </td>
              </tr>
            ) : backings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay soportes registrados
                </td>
              </tr>
            ) : (
              backings.map((backing) => (
                <tr key={backing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{backing.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">S/ {backing.pricePerFt2.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(backing.validFrom).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      backing.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {backing.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <RowActions actions={getRowActions(backing)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddBackingModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            refreshBackings()
          }}
          companyId={companyId}
        />
      )}

      {editingBacking && (
        <EditBackingModal
          open={!!editingBacking}
          backing={editingBacking}
          onClose={() => setEditingBacking(null)}
          onSuccess={() => {
            setEditingBacking(null)
            refreshBackings()
          }}
          companyId={companyId}
        />
      )}

      {viewingBacking && (
        <ViewBackingModal
          open={!!viewingBacking}
          backing={viewingBacking}
          onClose={() => setViewingBacking(null)}
        />
      )}
    </div>
  )
}