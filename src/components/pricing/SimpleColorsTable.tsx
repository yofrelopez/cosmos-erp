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

  // Cargar datos iniciales
  useEffect(() => {
    refreshColors()
  }, [])

  // Refresh data
  const refreshColors = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/colors')
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
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(color),
      variant: 'danger',
      disabled: deletingId === color.id
    }
  ]

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Catálogo de Colores</h3>
          <p className="text-gray-600 text-sm">
            Gestiona los nombres de colores disponibles para vidrios de tipo COLOR
          </p>
        </div>
        
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus size={16} />
          Nuevo Color
        </Button>
      </div>

      {/* Formulario de agregar */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del color
              </label>
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="ej. Azul, Verde, Bronce, Gris..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <Button type="submit" disabled={!newColorName.trim()}>
              Agregar
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowAddForm(false)
                setNewColorName('')
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre del Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Creación
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Cargando colores...
                </td>
              </tr>
            ) : colors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No hay colores registrados. Agrega el primer color.
                </td>
              </tr>
            ) : (
              colors.map((color) => (
                <tr key={color.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{color.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border border-gray-300"></div>
                      <div className="font-medium text-gray-900">{color.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(color.createdAt).toLocaleDateString('es-PE')}
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

      <div className="text-xs text-gray-500 bg-green-50 p-3 rounded-lg">
        <strong>🎨 Información:</strong> Los colores específicos se usan cuando el tipo de color es "COLOR". 
        Solo afectan la información mostrada, no el precio (que se determina por familia + espesor + tipo de color).
      </div>
    </div>
  )
}