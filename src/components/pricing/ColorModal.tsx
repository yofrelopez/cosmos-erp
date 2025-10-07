import { useState } from 'react'
import { MoldingColor } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { Palette, X } from 'lucide-react'
import { toast } from 'sonner'

interface ColorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (color: MoldingColor) => void
  color?: MoldingColor | null
  companyId: number
}

export default function ColorModal({ 
  isOpen, 
  onClose, 
  onSave, 
  color, 
  companyId 
}: ColorModalProps) {
  const [name, setName] = useState(color?.name || '')
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(color)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('El nombre del color es requerido')
      return
    }

    setLoading(true)
    
    try {
      const url = isEditing 
        ? `/api/pricing/molding-colors/${color!.id}`
        : '/api/pricing/molding-colors'
      
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
        throw new Error(error.message || 'Error al guardar el color')
      }

      const savedColor = await response.json()
      onSave(savedColor)
      toast.success(isEditing ? 'Color actualizado correctamente' : 'Color creado correctamente')
      handleClose()
    } catch (error) {
      console.error('Error saving color:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar el color')
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
            <Palette className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Editar Color' : 'Nuevo Color'}
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
                Nombre del Color
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ej: Blanco, Negro, Dorado, Plata, Café..."
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
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}