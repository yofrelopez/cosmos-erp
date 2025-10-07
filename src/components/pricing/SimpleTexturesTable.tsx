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
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(texture),
      variant: 'danger',
      disabled: deletingId === texture.id
    }
  ]

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Catálogo de Texturas</h3>
          <p className="text-gray-600 text-sm">
            Gestiona los nombres de texturas disponibles (solo informativos)
          </p>
        </div>
        
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus size={16} />
          Nueva Textura
        </Button>
      </div>

      {/* Formulario de agregar */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la textura
              </label>
              <input
                type="text"
                value={newTextureName}
                onChange={(e) => setNewTextureName(e.target.value)}
                placeholder="ej. Cuadriculado, Liso, Catedral..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <Button type="submit" disabled={!newTextureName.trim()}>
              Agregar
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowAddForm(false)
                setNewTextureName('')
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
                Nombre de la Textura
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
                  Cargando texturas...
                </td>
              </tr>
            ) : textures.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No hay texturas registradas. Agrega la primera textura.
                </td>
              </tr>
            ) : (
              textures.map((texture) => (
                <tr key={texture.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{texture.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{texture.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(texture.createdAt).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <RowActions actions={getRowActions(texture)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
        <strong>ℹ️ Información:</strong> Las texturas son solo nombres informativos que no afectan los precios. 
        Se usan únicamente para referencia y documentación.
      </div>
    </div>
  )
}