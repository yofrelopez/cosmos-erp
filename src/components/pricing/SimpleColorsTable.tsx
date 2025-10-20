'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { SimpleColor } from '@/types/newTypes'

interface Props {
  companyId: number // Mantenemos por consistencia pero no la usamos
}

export default function SimpleColorsTable({ companyId }: Props) {
  const [colors, setColors] = useState<SimpleColor[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingColor, setEditingColor] = useState<SimpleColor | null>(null)
  const [newColorName, setNewColorName] = useState('')
  const [editColorName, setEditColorName] = useState('')

  // Cargar datos iniciales
  useEffect(() => {
    refreshColors()
  }, [])

  // Refresh data
  const refreshColors = async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      const res = await fetch(`/api/pricing/colors?companyId=${companyId}`)
      if (res.ok) {
        const data = await res.json()
        setColors(data)
      }
    } catch (error) {
      console.error('Error refreshing colors:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColorName.trim()) return

    try {
      const res = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newColorName.trim() })
      })

      if (res.ok) {
        toast.success('Color creado correctamente')
        setNewColorName('')
        setShowAddForm(false)
        refreshColors()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Error al crear color')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  // Handle edit
  const handleEdit = (color: SimpleColor) => {
    setEditingColor(color)
    setEditColorName(color.name)
    setShowAddForm(false) // Cerrar formulario de agregar si está abierto
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editColorName.trim() || !editingColor) return

    try {
      const res = await fetch(`/api/colors/${editingColor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editColorName.trim() })
      })

      if (res.ok) {
        toast.success('Color actualizado correctamente')
        setEditingColor(null)
        setEditColorName('')
        refreshColors()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Error al actualizar color')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const cancelEdit = () => {
    setEditingColor(null)
    setEditColorName('')
  }

  // Handle delete
  const handleDelete = async (color: SimpleColor) => {
    toast(`¿Eliminar color "${color.name}"?`, {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setDeletingId(color.id)
          try {
            const res = await fetch(`/api/colors/${color.id}`, {
              method: 'DELETE'
            })

            if (res.ok) {
              toast.success('Color eliminado correctamente')
              refreshColors()
            } else {
              throw new Error('Error al eliminar')
            }
          } catch (error) {
            toast.error('Error al eliminar el color')
          } finally {
            setDeletingId(null)
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    })
  }

  const getRowActions = (color: SimpleColor): Action[] => [
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => handleEdit(color),
      variant: 'default',
      disabled: deletingId === color.id || editingColor !== null
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(color),
      variant: 'danger',
      disabled: deletingId === color.id || editingColor !== null
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 p-2.5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">🎨</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Catálogo de Colores</h3>
              <p className="text-gray-600 text-sm">
                Gestiona los nombres de colores disponibles para vidrios
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => {
            setShowAddForm(true)
            setEditingColor(null) // Cancelar edición si está activa
            setEditColorName('')
          }} 
          disabled={editingColor !== null}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nuevo Color</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>

      {/* Formulario de agregar */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del color
              </label>
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Ej: Azul Cobalto, Verde Esmeralda, Bronce Natural..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setNewColorName('')
                }}
                className="px-4 py-2"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!newColorName.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
              >
                <Plus size={16} className="mr-2" />
                Agregar Color
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario de edición */}
      {editingColor && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 shadow-sm">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">
                Editar color: #{editingColor.id}
              </label>
              <input
                type="text"
                value={editColorName}
                onChange={(e) => setEditColorName(e.target.value)}
                placeholder="Nombre del color"
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                required
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={cancelEdit}
                className="px-4 py-2 border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!editColorName.trim() || editColorName === editingColor.name}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
              >
                <Pencil size={16} className="mr-2" />
                Actualizar Color
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de colores */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {colors.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay colores registrados</h3>
              <p className="text-gray-500 mb-4">Comienza agregando tu primer color al catálogo</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus size={16} className="mr-2" />
                Agregar Primer Color
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                    Creado
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <span className="ml-2">Cargando colores...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  colors.map((color) => (
                    <tr key={color.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-sm font-mono text-gray-500">#{color.id}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 border-2 border-white shadow-sm"></div>
                          <div className="font-semibold text-gray-900">{color.name}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <div className="text-sm text-gray-500">
                          {new Date(color.createdAt).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                        <RowActions actions={getRowActions(color)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-purple-600 text-lg">ℹ️</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-semibold text-purple-800">Información sobre colores</h4>
            <p className="text-sm text-purple-700 mt-1">
              Los colores específicos se usan cuando el tipo de color es "COLOR". 
              Solo afectan la información mostrada, no influyen en el precio final 
              (que se determina por familia + espesor + tipo de color).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}