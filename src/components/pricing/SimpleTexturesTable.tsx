'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { SimpleTexture } from '@/types/newTypes'

interface Props {
  companyId: number // Mantenemos por consistencia pero no la usamos
}

export default function SimpleTexturesTable({ companyId }: Props) {
  const [textures, setTextures] = useState<SimpleTexture[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTexture, setEditingTexture] = useState<SimpleTexture | null>(null)
  const [newTextureName, setNewTextureName] = useState('')
  const [editTextureName, setEditTextureName] = useState('')

  // Cargar datos iniciales
  useEffect(() => {
    refreshTextures()
  }, [])

  // Refresh data
  const refreshTextures = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/pricing/textures')
      if (res.ok) {
        const data = await res.json()
        setTextures(data)
      }
    } catch (error) {
      console.error('Error refreshing textures:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTextureName.trim()) return

    try {
      const res = await fetch('/api/pricing/textures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTextureName.trim() })
      })

      if (res.ok) {
        toast.success('Textura creada correctamente')
        setNewTextureName('')
        setShowAddForm(false)
        refreshTextures()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Error al crear textura')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  // Handle edit
  const handleEdit = (texture: SimpleTexture) => {
    setEditingTexture(texture)
    setEditTextureName(texture.name)
    setShowAddForm(false) // Cerrar formulario de agregar si está abierto
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTextureName.trim() || !editingTexture) return

    try {
      const res = await fetch(`/api/pricing/textures/${editingTexture.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editTextureName.trim() })
      })

      if (res.ok) {
        toast.success('Textura actualizada correctamente')
        setEditingTexture(null)
        setEditTextureName('')
        refreshTextures()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Error al actualizar textura')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const cancelEdit = () => {
    setEditingTexture(null)
    setEditTextureName('')
  }

  // Handle delete
  const handleDelete = async (texture: SimpleTexture) => {
    toast(`¿Eliminar textura "${texture.name}"?`, {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setDeletingId(texture.id)
          try {
            const res = await fetch(`/api/pricing/textures/${texture.id}`, {
              method: 'DELETE'
            })

            if (res.ok) {
              toast.success('Textura eliminada correctamente')
              refreshTextures()
            } else {
              throw new Error('Error al eliminar')
            }
          } catch (error) {
            toast.error('Error al eliminar la textura')
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

  const getRowActions = (texture: SimpleTexture): Action[] => [
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => handleEdit(texture),
      variant: 'default',
      disabled: deletingId === texture.id || editingTexture !== null
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(texture),
      variant: 'danger',
      disabled: deletingId === texture.id || editingTexture !== null
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 p-2.5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">🌊</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Catálogo de Texturas</h3>
              <p className="text-gray-600 text-sm">
                Gestiona los tipos de textura disponibles para vidrios
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => {
            setShowAddForm(true)
            setEditingTexture(null) // Cancelar edición si está activa
            setEditTextureName('')
          }} 
          disabled={editingTexture !== null}
          className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nueva Textura</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </div>

      {/* Formulario de agregar */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la textura
              </label>
              <input
                type="text"
                value={newTextureName}
                onChange={(e) => setNewTextureName(e.target.value)}
                placeholder="Ej: Catedral, Cuadriculado, Martillado, Liso..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  setNewTextureName('')
                }}
                className="px-4 py-2"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!newTextureName.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
              >
                <Plus size={16} className="mr-2" />
                Agregar Textura
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario de edición */}
      {editingTexture && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 shadow-sm">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-teal-800 mb-2">
                Editar textura: #{editingTexture.id}
              </label>
              <input
                type="text"
                value={editTextureName}
                onChange={(e) => setEditTextureName(e.target.value)}
                placeholder="Nombre de la textura"
                className="w-full px-4 py-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                required
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={cancelEdit}
                className="px-4 py-2 border-teal-300 text-teal-700 hover:bg-teal-100"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!editTextureName.trim() || editTextureName === editingTexture.name}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
              >
                <Pencil size={16} className="mr-2" />
                Actualizar Textura
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de texturas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {textures.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🌊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay texturas registradas</h3>
              <p className="text-gray-500 mb-4">Comienza agregando tu primera textura al catálogo</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Plus size={16} className="mr-2" />
                Agregar Primera Textura
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
                    Textura
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
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                        <span className="ml-2">Cargando texturas...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  textures.map((texture) => (
                    <tr key={texture.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-sm font-mono text-gray-500">#{texture.id}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 border-2 border-white shadow-sm flex items-center justify-center">
                            <div className="w-3 h-3 bg-white/30 rounded-sm"></div>
                          </div>
                          <div className="font-semibold text-gray-900">{texture.name}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <div className="text-sm text-gray-500">
                          {new Date(texture.createdAt).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                        <RowActions actions={getRowActions(texture)} />
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
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-teal-600 text-lg">ℹ️</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-semibold text-teal-800">Información sobre texturas</h4>
            <p className="text-sm text-teal-700 mt-1">
              Las texturas son nombres informativos que no afectan los precios. 
              Se usan únicamente para referencia y documentación en las cotizaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}