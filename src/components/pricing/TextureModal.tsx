import { useState } from 'react'
import { MoldingTexture } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { Palette, X } from 'lucide-react'
import { toast } from 'sonner'

interface TextureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (texture: MoldingTexture) => void
  texture?: MoldingTexture | null
  companyId: number
}

export default function TextureModal({ 
  isOpen, 
  onClose, 
  onSave, 
  texture, 
  companyId 
}: TextureModalProps) {
  const [name, setName] = useState(texture?.name || '')
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(texture)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('El nombre de la textura es requerido')
      return
    }

    setLoading(true)
    
    try {
      const url = isEditing 
        ? `/api/pricing/molding-textures/${texture!.id}`
        : '/api/pricing/molding-textures'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          companyId
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al guardar la textura')
      }

      const savedTexture = await response.json()
      onSave(savedTexture)
      toast.success(isEditing ? 'Textura actualizada correctamente' : 'Textura creada correctamente')
      handleClose()
    } catch (error) {
      console.error('Error saving texture:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar la textura')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Editar Textura' : 'Nueva Textura'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Textura
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Lisa, Rugosa, Mate, Brillante..."
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}