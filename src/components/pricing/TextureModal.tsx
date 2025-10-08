import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MoldingTexture } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import BaseModal, { ModalContent, ModalFooter } from '@/components/ui/BaseModal'
import FormField, { FormInput } from '@/components/ui/FormField'
import { Waves } from 'lucide-react'
import { toast } from 'sonner'
import { getModalColors } from '@/components/ui/modal-tokens'

const textureSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres')
    .trim()
})

type TextureFormData = z.infer<typeof textureSchema>

interface TextureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (texture: MoldingTexture) => void
  texture?: MoldingTexture | null
  mode?: 'create' | 'edit' | 'view'
  companyId: number
}

export default function TextureModal({ 
  isOpen, 
  onClose, 
  onSave, 
  texture, 
  mode = 'create',
  companyId 
}: TextureModalProps) {
  const [loading, setLoading] = useState(false)
  const colors = getModalColors('texture')
  const isEditing = mode === 'edit'
  const isViewing = mode === 'view'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<TextureFormData>({
    resolver: zodResolver(textureSchema),
    defaultValues: {
      name: texture?.name || ''
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: TextureFormData) => {
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
          ...data,
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
    reset()
    onClose()
  }

  const title = isViewing ? 'Detalles de la Textura' : isEditing ? 'Editar Textura' : 'Nueva Textura'

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      icon={<Waves className={`h-5 w-5 ${colors.primary}`} />}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent>
          <div className="space-y-4">
            {/* Texture Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center border-2 border-purple-200">
                <Waves className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <FormField
              label="Nombre de la Textura"
              required
              error={errors.name?.message}
              description="Nombre descriptivo de la textura (ej: Lisa, Rugosa, Mate, Brillante)"
            >
              <FormInput
                {...register('name')}
                placeholder="Ingresa el nombre de la textura..."
                error={!!errors.name}
                disabled={loading || isViewing}
                className="text-center"
              />
            </FormField>

            {isViewing && texture && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Información de la Textura
                </div>
                <div className="text-sm text-gray-900">
                  <strong>ID:</strong> #{texture.id}
                </div>
                <div className="text-sm text-gray-900">
                  <strong>Creado:</strong> {new Date(texture.createdAt).toLocaleDateString()}
                </div>
                {texture.updatedAt !== texture.createdAt && (
                  <div className="text-sm text-gray-900">
                    <strong>Actualizado:</strong> {new Date(texture.updatedAt).toLocaleDateString()}
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
              {isEditing ? 'Actualizar' : 'Crear'} Textura
            </Button>
          )}
        </ModalFooter>
      </form>
    </BaseModal>
  )
}