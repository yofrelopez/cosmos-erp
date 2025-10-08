'use client'

import { useState, useEffect } from 'react'
import { MoldingColor } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import ColorModal from '@/components/pricing/ColorModal'
import PageHeader from '@/components/common/PageHeader'

export default function ColoresPage() {
  const companyId = useCompanyStore((s) => s.company?.id)
  const [colors, setColors] = useState<MoldingColor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingColor, setEditingColor] = useState<MoldingColor | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

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
    setModalMode('edit')
    setShowModal(true)
  }

  const getRowActions = (color: MoldingColor): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => {
        setEditingColor(color)
        setModalMode('view')
        setShowModal(true)
      },
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
      <>
        <PageHeader
          title="Colores"
        />
        <main className="flex-1 p-2.5 sm:p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No hay empresa seleccionada
              </h2>
              <p className="text-gray-600">
                Selecciona una empresa para ver los colores
              </p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <PageHeader 
        title="Colores"
        action={
          <Button 
            onClick={() => {
              setModalMode('create')
              setShowModal(true)
            }} 
            className="gap-2 w-full sm:w-auto"
          >
            <Plus size={16} />
            Nuevo Color
          </Button>
        }
      />

      <main className="flex-1 p-2.5 sm:p-6">
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 sm:px-6 py-4 text-center text-gray-500">
                      Cargando colores...
                    </td>
                  </tr>
                ) : colors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 sm:px-6 py-4 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Palette className="h-8 w-8 text-gray-400" />
                        <p>No hay colores registrados</p>
                        <Button 
                          onClick={() => {
                            setModalMode('create')
                            setShowModal(true)
                          }}
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
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">#{color.id}</div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        {renderColorSwatch(color)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center sm:block">
                          <div className="w-4 h-4 rounded mr-2 border border-gray-300 flex-shrink-0 sm:hidden">
                            {renderColorSwatch(color)}
                          </div>
                          <div className="font-medium text-gray-900 truncate">{color.name}</div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(color.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
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
            mode={modalMode}
            companyId={companyId!}
          />
        </div>
      </main>
    </>
  )
}