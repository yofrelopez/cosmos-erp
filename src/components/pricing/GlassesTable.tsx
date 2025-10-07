'use client'

import { useState, useEffect } from 'react'
import { PricingGlass } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { SerializedPricingGlass } from '@/types/newTypes'
import { useColors } from '@/hooks/useColors'
import AddGlassModal from './AddGlassModal'
import EditGlassModal from './EditGlassModal'
import ViewGlassModal from './ViewGlassModal'

interface Props {
  companyId: number
}

const GLASS_FAMILIES = [
  { value: 'PLANO', label: 'Plano' },
  { value: 'CATEDRAL', label: 'Catedral' },
  { value: 'TEMPLADO', label: 'Templado' },
  { value: 'ESPEJO', label: 'Espejo' }
]

const GLASS_COLOR_TYPES = [
  { value: 'INCOLORO', label: 'Incoloro' },
  { value: 'COLOR', label: 'Color' },
  { value: 'POLARIZADO', label: 'Polarizado' }
]

export default function GlassesTable({ companyId }: Props) {
  const [glasses, setGlasses] = useState<SerializedPricingGlass[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const { colors } = useColors()

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedGlass, setSelectedGlass] = useState<SerializedPricingGlass | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      refreshGlasses()
    }
  }, [companyId, selectedFamily]) // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh data
  const refreshGlasses = async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      let url = `/api/pricing/glasses?companyId=${companyId}`
      
      if (selectedFamily) {
        url += `&family=${selectedFamily}`
      }
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setGlasses(data)
      }
    } catch (error) {
      console.error('Error refreshing glasses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete with confirmation
  const handleDelete = async (glass: SerializedPricingGlass) => {
    if (!companyId) return
    
    // Toast de confirmación
    toast(`¿Eliminar "${glass.commercialName} ${glass.thicknessMM}mm ${getColorDisplay(glass)}"?`, {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setDeletingId(glass.id)
          try {
            const res = await fetch(`/api/pricing/glasses/${glass.id}`, {
              method: 'DELETE'
            })

            if (res.ok) {
              toast.success('Vidrio eliminado correctamente')
              refreshGlasses()
            } else {
              throw new Error('Error al eliminar')
            }
          } catch (error) {
            toast.error('Error al eliminar el vidrio')
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

  const getRowActions = (glass: SerializedPricingGlass): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => {
        setSelectedGlass(glass)
        setShowViewModal(true)
      },
      variant: 'default'
    },
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => {
        setSelectedGlass(glass)
        setShowEditModal(true)
      },
      variant: 'default'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(glass),
      variant: 'danger',
      disabled: deletingId === glass.id
    }
  ]

  const getFamilyLabel = (family: string) => {
    const familyConfig = GLASS_FAMILIES.find(f => f.value === family)
    return familyConfig?.label || family
  }

  const getColorTypeLabel = (colorType: string) => {
    const colorTypeConfig = GLASS_COLOR_TYPES.find(c => c.value === colorType)
    return colorTypeConfig?.label || colorType
  }

  const getColorDisplay = (glass: SerializedPricingGlass) => {
    const colorTypeLabel = getColorTypeLabel(glass.colorType)
    if (glass.colorName) {
      return `${colorTypeLabel} (${glass.colorName})`
    }
    return colorTypeLabel
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las familias</option>
            {GLASS_FAMILIES.map((family) => (
              <option key={family.value} value={family.value}>
                {family.label}
              </option>
            ))}
          </select>
        </div>
        
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus size={16} />
          Nuevo Vidrio
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Comercial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Familia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Espesor (mm)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
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
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Cargando vidrios...
                </td>
              </tr>
            ) : glasses.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No hay vidrios registrados
                </td>
              </tr>
            ) : (
              glasses.map((glass) => (
                <tr key={glass.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 font-medium">{glass.commercialName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{getFamilyLabel(glass.family)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 font-medium">{glass.thicknessMM} mm</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{getColorDisplay(glass)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-green-600">S/ {glass.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(glass.validFrom).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      glass.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {glass.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <RowActions actions={getRowActions(glass)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <AddGlassModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        companyId={companyId}
        onGlassAdded={refreshGlasses}
      />

      {selectedGlass && (
        <>
          <EditGlassModal
            open={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedGlass(null)
            }}
            glass={selectedGlass}
            onGlassUpdated={refreshGlasses}
          />

          <ViewGlassModal
            open={showViewModal}
            onClose={() => {
              setShowViewModal(false)
              setSelectedGlass(null)
            }}
            glass={selectedGlass}
          />
        </>
      )}
    </div>
  )
}