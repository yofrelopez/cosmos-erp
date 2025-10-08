'use client'

import { useState, useEffect } from 'react'
import { PricingMolding, PricingThickness } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import AddMoldingModal from './AddMoldingModal'
import EditMoldingModal from './EditMoldingModal'
import ViewMoldingModal from './ViewMoldingModal'

// Tipos serializados
type SerializedThickness = Omit<PricingThickness, 'pricePerM'> & {
  pricePerM: number | null
}

type SerializedMolding = Omit<PricingMolding, 'pricePerM'> & {
  pricePerM: number
  thickness: SerializedThickness
}

interface Props {
  companyId: number
}

const QUALITIES = [
  { value: 'SIMPLE', label: 'Simple', color: 'bg-blue-100 text-blue-800' },
  { value: 'FINA', label: 'Fina', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'BASTIDOR', label: 'Bastidor', color: 'bg-purple-100 text-purple-800' }
]

export default function MoldingsTable({ companyId }: Props) {
  const [moldings, setMoldings] = useState<SerializedMolding[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMolding, setEditingMolding] = useState<SerializedMolding | null>(null)
  const [viewingMolding, setViewingMolding] = useState<SerializedMolding | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedQuality, setSelectedQuality] = useState<string>('')

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      refreshMoldings()
    }
  }, [companyId, selectedQuality]) // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh data
  const refreshMoldings = async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      let url = `/api/pricing/moldings?companyId=${companyId}`
      if (selectedQuality) {
        url += `&quality=${selectedQuality}`
      }
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setMoldings(data)
      }
    } catch (error) {
      console.error('Error refreshing moldings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete with confirmation
  const handleDelete = async (molding: SerializedMolding) => {
    if (!companyId) return
    
    // Toast de confirmación
    toast(`¿Eliminar "${molding.name}"?`, {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setDeletingId(molding.id)
          try {
            const res = await fetch(`/api/pricing/moldings/${molding.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyId })
            })

            if (res.ok) {
              toast.success('Moldura eliminada correctamente')
              refreshMoldings()
            } else {
              throw new Error('Error al eliminar')
            }
          } catch (error) {
            toast.error('Error al eliminar la moldura')
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

  const getRowActions = (molding: SerializedMolding): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => setViewingMolding(molding),
      variant: 'default'
    },
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => setEditingMolding(molding),
      variant: 'default'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(molding),
      variant: 'danger',
      disabled: deletingId === molding.id
    }
  ]

  const getQualityStyle = (quality: string) => {
    const qualityConfig = QUALITIES.find(q => q.value === quality)
    return qualityConfig?.color || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2.5 sm:p-6">
      {/* Header con filtros y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Filtro por calidad */}
          <div>
            <label htmlFor="quality-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Filtrar por calidad
            </label>
            <select
              id="quality-filter"
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            >
              <option value="">Todas las calidades</option>
              {QUALITIES.map((quality) => (
                <option key={quality.value} value={quality.value}>
                  {quality.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contador de resultados */}
          <div className="text-xs sm:text-sm text-gray-500 flex items-center">
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs sm:text-sm">
              {moldings.length} {moldings.length === 1 ? 'moldura' : 'molduras'}
            </span>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nueva Moldura</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Calidad
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Espesor
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio (S/)
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vigente desde
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Cargando molduras...
                </td>
              </tr>
            ) : moldings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 sm:px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="font-medium">No hay molduras registradas</p>
                    <p className="text-sm">Comienza agregando tu primera moldura</p>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      size="sm"
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Nueva Moldura
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              moldings.map((molding) => (
                <tr key={molding.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="font-medium text-gray-900 truncate">{molding.name}</div>
                    <div className="sm:hidden text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getQualityStyle(molding.quality)}`}>
                        {QUALITIES.find(q => q.value === molding.quality)?.label}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        molding.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {molding.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityStyle(molding.quality)}`}>
                      {QUALITIES.find(q => q.value === molding.quality)?.label || molding.quality}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{molding.thickness.name}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 font-medium">S/ {molding.pricePerM.toFixed(2)}</div>
                    <div className="lg:hidden text-xs text-gray-500">{molding.thickness.name}</div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(molding.validFrom).toLocaleDateString()}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      molding.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {molding.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                    <RowActions actions={getRowActions(molding)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddMoldingModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            refreshMoldings()
          }}
          companyId={companyId}
        />
      )}

      {editingMolding && (
        <EditMoldingModal
          open={!!editingMolding}
          molding={editingMolding}
          onClose={() => setEditingMolding(null)}
          onSuccess={() => {
            setEditingMolding(null)
            refreshMoldings()
          }}
          companyId={companyId}
        />
      )}

      {viewingMolding && (
        <ViewMoldingModal
          open={!!viewingMolding}
          molding={viewingMolding}
          onClose={() => setViewingMolding(null)}
        />
      )}
    </div>
  )
}