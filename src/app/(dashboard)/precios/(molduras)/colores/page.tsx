'use client'

import { useState, useEffect } from 'react'
import { MoldingColor } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import ColorModal from '@/components/pricing/ColorModal'

export default function ColoresPage() {
  const companyId = useCompanyStore((s) => s.company?.id)
  const [colors, setColors] = useState<MoldingColor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingColor, setEditingColor] = useState<MoldingColor | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      refreshColors()
    }
  }, [companyId])

  // Refresh data
  const refreshColors = async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      const res = await fetch(`/api/pricing/molding-colors?companyId=${companyId}`)
      if (res.ok) {
        const data = await res.json()
        setColors(data)
      }
    } catch (error) {
      console.error('Error refreshing colors:', error)
      toast.error('Error al cargar los colores')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete with confirmation
  const handleDelete = async (color: MoldingColor) => {
    if (!companyId) return
    
    toast(`¿Eliminar color "${color.name}"?`, {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          try {
            const res = await fetch(`/api/pricing/molding-colors/${color.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyId })
            })

            if (res.ok) {
              toast.success('Color eliminado correctamente')
              refreshColors()
            } else {
              throw new Error('Error al eliminar')
            }
          } catch (error) {
            toast.error('Error al eliminar el color')
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    })
  }

  // Handle save color
  const handleSave = (savedColor: MoldingColor) => {
    refreshColors()
    setShowModal(false)
    setEditingColor(null)
  }

  // Handle edit color
  const handleEdit = (color: MoldingColor) => {
    setEditingColor(color)
    setShowModal(true)
  }

  const getRowActions = (color: MoldingColor): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => console.log('Ver color:', color.id),
      variant: 'default'
    },
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => handleEdit(color),
      variant: 'default'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(color),
      variant: 'danger'
    }
  ]

  // Helper para mostrar color
  const renderColorSwatch = (color: MoldingColor) => {
    return (
      <div className="h-8 w-8 rounded bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center border-2 border-gray-200">
        <Palette className="h-4 w-4 text-amber-600" />
      </div>
    )
  }

  if (!companyId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-amber-600" />
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Colores de Molduras</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Gestiona el catálogo de colores disponibles para molduras
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-10">
          <p className="text-gray-500">Selecciona una empresa para continuar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <Palette className="h-6 w-6 text-amber-600" />
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Colores de Molduras</h2>
              <p className="mt-1 text-sm text-gray-600">
                Gestiona el catálogo de colores disponibles para molduras
              </p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={() => setShowModal(true)} 
            className="gap-2 w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
          >
            <Plus size={16} />
            Nuevo Color
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
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
                  Cargando colores...
                </td>
              </tr>
            ) : colors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Palette className="h-8 w-8 text-gray-400" />
                    <p>No hay colores registrados</p>
                    <Button 
                      onClick={() => setShowModal(true)}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Plus size={14} />
                      Crear primer color
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              colors.map((color) => (
                <tr key={color.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">#{color.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderColorSwatch(color)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{color.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(color.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <RowActions actions={getRowActions(color)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <ColorModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingColor(null)
        }}
        onSave={handleSave}
        color={editingColor}
        companyId={companyId!}
      />
    </div>
  )
}