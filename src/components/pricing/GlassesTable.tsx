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
  { value: 'POLARIZADO', label: 'Polarizado' },
  { value: 'REFLEJANTE', label: 'Reflejante' }
]

type SortField = 'commercialName' | 'thicknessMM' | 'price'
type SortDirection = 'asc' | 'desc'

export default function GlassesTable({ companyId }: Props) {
  const [glasses, setGlasses] = useState<SerializedPricingGlass[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>('commercialName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
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

  const getFamilyBadgeClasses = (family: string) => {
    switch (family) {
      case 'PLANO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CATEDRAL':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'TEMPLADO':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ESPEJO':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200' // Fallback a azul
    }
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

  // Función para manejar el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Función para ordenar los vidrios
  const sortedGlasses = [...glasses].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'commercialName':
        aValue = a.commercialName.toLowerCase()
        bValue = b.commercialName.toLowerCase()
        break
      case 'thicknessMM':
        aValue = a.thicknessMM
        bValue = b.thicknessMM
        break
      case 'price':
        aValue = a.price
        bValue = b.price
        break
      default:
        return 0
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Función helper para mostrar íconos de ordenamiento
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2.5 sm:p-6">
      {/* Header con filtros y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Filtro por familia */}
          <div>
            <label htmlFor="family-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Filtrar por familia
            </label>
            <select
              id="family-filter"
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            >
              <option value="">Todas las familias</option>
              {GLASS_FAMILIES.map((family) => (
                <option key={family.value} value={family.value}>
                  {family.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contador de resultados */}
          <div className="text-xs sm:text-sm text-gray-500 flex items-center">
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs sm:text-sm">
              {glasses.length} {glasses.length === 1 ? 'vidrio' : 'vidrios'}
            </span>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nuevo Vidrio</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('commercialName')}
                  className="flex items-center gap-1 hover:text-gray-800 transition-colors group"
                >
                  <span>Nombre Comercial</span>
                  <span className="text-gray-400 group-hover:text-gray-600 font-normal">
                    {getSortIcon('commercialName')}
                  </span>
                </button>
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Familia
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('thicknessMM')}
                  className="flex items-center gap-1 hover:text-gray-800 transition-colors group"
                >
                  <span>Espesor</span>
                  <span className="text-gray-400 group-hover:text-gray-600 font-normal">
                    {getSortIcon('thicknessMM')}
                  </span>
                </button>
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Color
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-1 hover:text-gray-800 transition-colors group"
                >
                  <span>Precio</span>
                  <span className="text-gray-400 group-hover:text-gray-600 font-normal">
                    {getSortIcon('price')}
                  </span>
                </button>
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Vigente desde
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                Estado
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Cargando vidrios...</span>
                  </div>
                </td>
              </tr>
            ) : glasses.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 sm:px-6 py-8 sm:py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Plus size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay vidrios registrados</h3>
                    <p className="text-gray-500 mb-4 max-w-md">
                      {selectedFamily 
                        ? `No se encontraron vidrios de la familia "${getFamilyLabel(selectedFamily)}".`
                        : 'Comienza agregando tu primer vidrio al catálogo de precios.'
                      }
                    </p>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus size={16} className="mr-2" />
                      {selectedFamily ? 'Agregar Vidrio' : 'Agregar Primer Vidrio'}
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              sortedGlasses.map((glass) => (
                <tr key={glass.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-gray-900 font-semibold text-sm">{glass.commercialName}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getFamilyBadgeClasses(glass.family)}`}>
                      {getFamilyLabel(glass.family)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded">
                      {glass.thicknessMM} mm
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-gray-900 text-sm">{getColorDisplay(glass)}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="font-semibold text-green-600 text-sm">
                      S/ {glass.price.toLocaleString('es-PE', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                    <div className="text-sm text-gray-500">
                      {new Date(glass.validFrom).toLocaleDateString('es-PE')}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                      glass.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {glass.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    <RowActions actions={getRowActions(glass)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
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