'use client'

import { useState, useEffect } from 'react'
import { PricingThickness } from '@prisma/client'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import EditThicknessModal from './EditThicknessModal'
import ViewThicknessModal from './ViewThicknessModal'

interface Props {
  companyId: number
}

export default function ThicknessesTable({ companyId }: Props) {
  const [thicknesses, setThicknesses] = useState<PricingThickness[]>([])
  const [editingThickness, setEditingThickness] = useState<PricingThickness | null>(null)
  const [viewingThickness, setViewingThickness] = useState<PricingThickness | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      refreshThicknesses()
    }
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh data
  const refreshThicknesses = async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      const url = `/api/pricing/thicknesses?companyId=${companyId}`
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setThicknesses(data)
      }
    } catch (error) {
      console.error('Error refreshing thicknesses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete with confirmation
  const handleDelete = async (thickness: PricingThickness) => {
    if (!companyId) return
    
    // Toast de confirmación
    toast(`¿Eliminar "${thickness.name}"?`, {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setDeletingId(thickness.id)
          try {
            const res = await fetch(`/api/pricing/thicknesses/${thickness.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyId })
            })

            if (res.ok) {
              toast.success('Espesor eliminado correctamente')
              refreshThicknesses()
            } else {
              const errorData = await res.json()
              toast.error(errorData.message || 'Error al eliminar')
            }
          } catch (error) {
            toast.error('Error al eliminar el espesor')
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

  const getRowActions = (thickness: PricingThickness): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => setViewingThickness(thickness),
      variant: 'default'
    },
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => setEditingThickness(thickness),
      variant: 'default'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(thickness),
      variant: 'danger',
      disabled: deletingId === thickness.id
    }
  ]

  return (
    <div className="space-y-4">

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  Cargando espesores...
                </td>
              </tr>
            ) : thicknesses.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No hay espesores registrados
                </td>
              </tr>
            ) : (
              thicknesses.map((thickness) => (
                <tr key={thickness.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">#{thickness.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{thickness.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <RowActions actions={getRowActions(thickness)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {editingThickness && (
        <EditThicknessModal
          open={!!editingThickness}
          thickness={editingThickness}
          onClose={() => setEditingThickness(null)}
          onSuccess={() => {
            setEditingThickness(null)
            refreshThicknesses()
          }}
          companyId={companyId}
        />
      )}

      {viewingThickness && (
        <ViewThicknessModal
          open={!!viewingThickness}
          thickness={viewingThickness}
          onClose={() => setViewingThickness(null)}
        />
      )}
    </div>
  )
}