'use client'

import { useState, useEffect } from 'react'
import { MoldingTexture } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import RowActions, { Action } from '@/components/common/RowActions'
import { Eye, Pencil, Trash2, Plus, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import TextureModal from '@/components/pricing/TextureModal'
import PageHeader from '@/components/common/PageHeader'

export default function TexturasPage() {
  const companyId = useCompanyStore((s) => s.company?.id)
  const [textures, setTextures] = useState<MoldingTexture[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTexture, setEditingTexture] = useState<MoldingTexture | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

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
    setModalMode('edit')
    setShowModal(true)
  }

  const getRowActions = (texture: MoldingTexture): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => {
        setEditingTexture(texture)
        setModalMode('view')
        setShowModal(true)
      },
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
      <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestión de Precios - Texturas"
            subtitle="Gestiona el catálogo de texturas disponibles para molduras"
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Precios', href: '/precios' },
              { label: 'Texturas', href: '/precios/texturas' }
            ]}
          />
          <div className="text-center py-10">
            <p className="text-gray-500">Selecciona una empresa para continuar</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestión de Precios - Texturas"
          subtitle="Gestiona el catálogo de texturas disponibles para molduras"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Precios', href: '/precios' },
            { label: 'Texturas', href: '/precios/texturas' }
          ]}
          action={
            <Button 
              onClick={() => {
                setModalMode('create')
                setShowModal(true)
              }} 
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nueva Textura</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          }
        />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-2.5 sm:p-6">
      
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
                      onClick={() => {
                        setModalMode('create')
                        setShowModal(true)
                      }}
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

          </div>
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
          mode={modalMode}
          companyId={companyId!}
        />
      </div>
    </main>
  )
}