'use client'

import { useState, useEffect } from 'react'
import { PricingAccessory } from '@prisma/client'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import ViewAccessoryModal from './ViewAccessoryModal'
import EditAccessoryModal from './EditAccessoryModal'
import AddAccessoryModal from './AddAccessoryModal'

// Tipo para accesorios con precio serializado
type SerializedAccessory = Omit<PricingAccessory, 'price'> & {
  price: number
}

interface Props {
  companyId: number
}

export default function AccessoriesTable({ companyId }: Props) {
  const [accessories, setAccessories] = useState<SerializedAccessory[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAccessory, setEditingAccessory] = useState<SerializedAccessory | null>(null)
  const [viewingAccessory, setViewingAccessory] = useState<SerializedAccessory | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      refreshAccessories()
    }
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh data
  const refreshAccessories = async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      const res = await fetch(`/api/pricing/accessories?companyId=${companyId}`)
      if (res.ok) {
        const data = await res.json()
        // Los datos ya vienen serializados desde el API
        setAccessories(data)
      }
    } catch (error) {
      console.error('Error refreshing accessories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete with confirmation
  const handleDelete = async (accessory: SerializedAccessory) => {
    if (!companyId) return
    
    // Toast de confirmación
    toast(`¿Eliminar "${accessory.name}"?`, {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setDeletingId(accessory.id)
          try {
            const res = await fetch(`/api/pricing/accessories/${accessory.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyId })
            })

            if (res.ok) {
              toast.success('Accesorio eliminado correctamente')
              refreshAccessories()
            } else {
              throw new Error('Error al eliminar')
            }
          } catch (error) {
            toast.error('Error al eliminar el accesorio')
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

  const getRowActions = (accessory: SerializedAccessory): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => setViewingAccessory(accessory),
      variant: 'default'
    },
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => setEditingAccessory(accessory),
      variant: 'default'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(accessory),
      variant: 'danger',
      disabled: deletingId === accessory.id
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus size={16} />
          Nuevo Accesorio
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
                Precio (S/)
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
                  Cargando accesorios...
                </td>
              </tr>
            ) : accessories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay accesorios registrados
                </td>
              </tr>
            ) : (
              accessories.map((accessory) => (
                <tr key={accessory.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{accessory.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">S/ {Number(accessory.price).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(accessory.validFrom).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      accessory.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {accessory.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <RowActions actions={getRowActions(accessory)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddAccessoryModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            refreshAccessories()
          }}
        />
      )}

      {editingAccessory && (
        <EditAccessoryModal
          open={!!editingAccessory}
          accessory={editingAccessory}
          onClose={() => setEditingAccessory(null)}
          onSuccess={() => {
            setEditingAccessory(null)
            refreshAccessories()
          }}
        />
      )}

      {viewingAccessory && (
        <ViewAccessoryModal
          open={!!viewingAccessory}
          accessory={viewingAccessory}
          onClose={() => setViewingAccessory(null)}
        />
      )}
    </div>
  )
}