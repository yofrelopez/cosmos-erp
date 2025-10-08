import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MoldingColor } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import BaseModal, { ModalContent, ModalFooter } from '@/components/ui/BaseModal'
import FormField, { FormInput } from '@/components/ui/FormField'
import { Palette } from 'lucide-react'
import { toast } from 'sonner'
import { getModalColors } from '@/components/ui/modal-tokens'

const colorSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim()
})

type ColorFormData = z.infer<typeof colorSchema>

interface ColorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (color: MoldingColor) => void
  color?: MoldingColor | null
  mode?: 'create' | 'edit' | 'view'
  companyId: number
}

export default function ColorModal({ 
  isOpen, 
  onClose, 
  onSave, 
  color, 
  mode = 'create',
  companyId 
}: ColorModalProps) {
  const [loading, setLoading] = useState(false)
  const colors = getModalColors('color')
  const isEditing = mode === 'edit'
  const isViewing = mode === 'view'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ColorFormData>({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      name: color?.name || ''
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: ColorFormData) => {
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
          ...data,
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
    reset()
    onClose()
  }

  const title = isViewing ? 'Detalles del Color' : isEditing ? 'Editar Color' : 'Nuevo Color'

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      icon={<Palette className={`h-5 w-5 ${colors.primary}`} />}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent>
          <div className="space-y-4">
            {/* Color Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center border-2 border-pink-200">
                <Palette className="w-8 h-8 text-pink-600" />
              </div>
            </div>

            <FormField
              label="Nombre del Color"
              required
              error={errors.name?.message}
              description="Nombre descriptivo del color (ej: Blanco Nieve, Negro Mate, Dorado Brillante)"
            >
              <FormInput
                {...register('name')}
                placeholder="Ingresa el nombre del color..."
                error={!!errors.name}
                disabled={loading || isViewing}
                className="text-center"
              />
            </FormField>

            {isViewing && color && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Información del Color
                </div>
                <div className="text-sm text-gray-900">
                  <strong>ID:</strong> #{color.id}
                </div>
                <div className="text-sm text-gray-900">
                  <strong>Creado:</strong> {new Date(color.createdAt).toLocaleDateString()}
                </div>
                {color.updatedAt !== color.createdAt && (
                  <div className="text-sm text-gray-900">
                    <strong>Actualizado:</strong> {new Date(color.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </ModalContent>
        
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {isViewing ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!isViewing && (
            <Button
              type="submit"
              loading={loading}
              disabled={!isValid}
              className={colors.bg}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Color
            </Button>
          )}
        </ModalFooter>
      </form>
    </BaseModal>
  )
}