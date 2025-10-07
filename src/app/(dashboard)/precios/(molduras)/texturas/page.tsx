'use client'

import { useState, useEffect } from 'react'
import { MoldingTexture } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import TextureModal from '@/components/pricing/TextureModal'

export default function TexturasPage() {
  const companyId = useCompanyStore((s) => s.company?.id)
  const [textures, setTextures] = useState<MoldingTexture[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTexture, setEditingTexture] = useState<MoldingTexture | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    if (companyId) {
      refreshTextures()
    }
  }, [companyId])

  // Refresh data
  const refreshTextures = async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      const res = await fetch(`/api/pricing/molding-textures?companyId=${companyId}`)
      if (res.ok) {
        const data = await res.json()
        setTextures(data)
      }
    } catch (error) {
      console.error('Error refreshing textures:', error)
      toast.error('Error al cargar las texturas')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete with confirmation
  const handleDelete = async (texture: MoldingTexture) => {
    if (!companyId) return
    
    toast(`¿Eliminar textura "${texture.name}"?`, {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          try {
            const res = await fetch(`/api/pricing/molding-textures/${texture.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyId })
            })

            if (res.ok) {
              toast.success('Textura eliminada correctamente')
              refreshTextures()
            } else {
              throw new Error('Error al eliminar')
            }
          } catch (error) {
            toast.error('Error al eliminar la textura')
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    })
  }

  // Handle save texture
  const handleSave = (savedTexture: MoldingTexture) => {
    refreshTextures()
    setShowModal(false)
    setEditingTexture(null)
  }

  // Handle edit texture
  const handleEdit = (texture: MoldingTexture) => {
    setEditingTexture(texture)
    setShowModal(true)
  }

  const getRowActions = (texture: MoldingTexture): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => console.log('Ver textura:', texture.id),
      variant: 'default'
    },
    {
      label: 'Editar',
      icon: Pencil,
      onClick: () => handleEdit(texture),
      variant: 'default'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: () => handleDelete(texture),
      variant: 'danger'
    }
  ]

  if (!companyId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-purple-600" />
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Texturas de Molduras</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Gestiona el catálogo de texturas disponibles para molduras
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
            <Palette className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Texturas de Molduras</h2>
              <p className="mt-1 text-sm text-gray-600">
                Gestiona el catálogo de texturas disponibles para molduras
              </p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={() => setShowModal(true)} 
            className="gap-2 w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          >
            <Plus size={16} />
            Nueva Textura
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
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Cargando texturas...
                </td>
              </tr>
            ) : textures.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Palette className="h-8 w-8 text-gray-400" />
                    <p>No hay texturas registradas</p>
                    <Button 
                      onClick={() => setShowModal(true)}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Plus size={14} />
                      Crear primera textura
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              textures.map((texture) => (
                <tr key={texture.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">#{texture.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                        <Palette className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="font-medium text-gray-900">{texture.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(texture.createdAt).toLocaleDateString()}
                    </div>
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

      {/* Modal */}
      <TextureModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingTexture(null)
        }}
        onSave={handleSave}
        texture={editingTexture}
        companyId={companyId!}
      />
    </div>
  )
}