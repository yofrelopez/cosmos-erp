'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import BaseModal from '@/components/ui/BaseModal'
import FormField, { FormInput, FormSelect } from '@/components/ui/FormField'
import InfoCard, { Badge } from '@/components/ui/InfoCard'
import { getModalColors } from '@/components/ui/modal-tokens'
import { Square } from 'lucide-react'
import type { SerializedPricingGlass } from '@/types/newTypes'

const GLASS_FAMILIES = [
  { value: 'PLANO', label: 'Plano' },
  { value: 'CATEDRAL', label: 'Catedral' },
  { value: 'TEMPLADO', label: 'Templado' },
  { value: 'ESPEJO', label: 'Espejo' }
]

const GLASS_COLOR_TYPES = [
  { value: 'INCOLORO', label: 'Incoloro' },
  { value: 'COLOR', label: 'Color' },
  { value: 'POLARIZADO', label: 'Polarizado' },
  { value: 'REFLEJANTE', label: 'Reflejante' }
]

const glassSchema = z.object({
  commercialName: z.string()
    .min(2, 'El nombre comercial debe tener al menos 2 caracteres')
    .max(100, 'El nombre comercial no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúñÑ0-9\s\-\.]+$/, 'Solo se permiten letras, números, espacios, guiones y puntos'),
  family: z.enum(['PLANO', 'CATEDRAL', 'TEMPLADO', 'ESPEJO'], { message: 'La familia es requerida' }),
  thicknessMM: z.number().positive('El espesor debe ser mayor a 0'),
  colorType: z.enum(['INCOLORO', 'COLOR', 'POLARIZADO', 'REFLEJANTE'], { message: 'El tipo de color es requerido' }),
  colorId: z.number().optional(),
  price: z.number().positive('El precio debe ser mayor a 0')
})

type GlassFormData = z.infer<typeof glassSchema>

interface Props {
  open: boolean
  onClose: () => void
  onGlassUpdated: () => void
  glass: SerializedPricingGlass
}

export default function EditGlassModal({ open, onClose, onGlassUpdated, glass }: Props) {
  const [loading, setLoading] = useState(false)
  const colors = getModalColors('glass')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<GlassFormData>({
    resolver: zodResolver(glassSchema),
    mode: 'onChange'
  })

  const selectedFamily = watch('family')
  const selectedColorType = watch('colorType')

  useEffect(() => {
    if (glass) {
      reset({
        commercialName: glass.commercialName,
        family: glass.family as 'PLANO' | 'CATEDRAL' | 'TEMPLADO' | 'ESPEJO',
        thicknessMM: glass.thicknessMM,
        colorType: glass.colorType as 'INCOLORO' | 'COLOR' | 'POLARIZADO' | 'REFLEJANTE',
        colorId: undefined, // En lista de precios no manejamos colores específicos
        price: glass.price
      })
    }
  }, [glass, reset])

  // Auto-ajustar reglas de negocio
  const handleFamilyChange = (family: string) => {
    setValue('family', family as any)
    
    // Si es templado, solo puede ser liso (INCOLORO)
    if (family === 'TEMPLADO') {
      setValue('colorType', 'INCOLORO')
    }
    // En lista de precios no manejamos colores específicos
    setValue('colorId', undefined)
  }

  const handleColorTypeChange = (colorType: string) => {
    setValue('colorType', colorType as any)
    // En lista de precios no manejamos colores específicos
    setValue('colorId', undefined)
  }

  const onSubmit = async (data: GlassFormData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pricing/glasses/${glass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Vidrio actualizado correctamente')
        onGlassUpdated()
        handleClose() // Cerrar modal después de actualización exitosa
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar el vidrio')
      }
    } catch (error) {
      toast.error('Error al actualizar el vidrio')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <BaseModal
      isOpen={open}
      onClose={handleClose}
      title="Editar Vidrio"
      description={`Modificar vidrio: ${glass.commercialName}`}
      icon={<Square size={20} className={colors.primary} />}
      size="lg"
      showCloseButton
    >
      {/* Metadata */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard 
            label="ID del Vidrio" 
            value={`#${glass.id}`} 
          />
          <InfoCard 
            label="Estado" 
            value={<Badge variant={glass.isActive ? "success" : "error"}>
              {glass.isActive ? 'Activo' : 'Inactivo'}
            </Badge>} 
          />
          <InfoCard 
            label="Precio Actual" 
            value={`S/ ${glass.price.toFixed(2)}`}
            valueClassName="text-green-600 font-semibold" 
          />
          <InfoCard 
            label="Espesor" 
            value={`${glass.thicknessMM} mm`} 
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
        {/* Información Comercial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormField
              label="Nombre Comercial"
              required
              description="Solo letras, números, espacios, guiones y puntos. Máximo 100 caracteres."
              error={errors.commercialName?.message}
            >
              <FormInput
                {...register('commercialName')}
                type="text"
                placeholder="Ej: Templado 6mm, Doble cristal, etc."
                disabled={loading}
                error={!!errors.commercialName}
              />
            </FormField>
          </div>

          <FormField
            label="Familia"
            required
            error={errors.family?.message}
          >
            <FormSelect
              {...register('family')}
              onChange={(e) => handleFamilyChange(e.target.value)}
              disabled={loading}
              error={!!errors.family}
            >
              <option value="">Seleccionar familia</option>
              {GLASS_FAMILIES.map((family) => (
                <option key={family.value} value={family.value}>
                  {family.label}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <FormField
            label="Espesor (mm)"
            required
            error={errors.thicknessMM?.message}
          >
            <FormInput
              {...register('thicknessMM', { valueAsNumber: true })}
              type="number"
              step="0.1"
              min="0"
              placeholder="5.5"
              disabled={loading}
              error={!!errors.thicknessMM}
            />
          </FormField>
        </div>

        {/* Información de Color y Precio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Tipo de Color"
            required
            description={selectedFamily === 'TEMPLADO' ? 'Los vidrios templados solo pueden ser lisos (incoloro)' : undefined}
            error={errors.colorType?.message}
          >
            <FormSelect
              {...register('colorType')}
              onChange={(e) => handleColorTypeChange(e.target.value)}
              disabled={loading || selectedFamily === 'TEMPLADO'}
              error={!!errors.colorType}
            >
              {GLASS_COLOR_TYPES.map((colorType) => (
                <option key={colorType.value} value={colorType.value}>
                  {colorType.label}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <FormField
            label="Precio (S/)"
            required
            error={errors.price?.message}
          >
            <FormInput
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              disabled={loading}
              error={!!errors.price}
            />
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !isValid}
            className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all ${colors.bg} ${colors.ring}`}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            )}
            <span>Actualizar Vidrio</span>
          </button>
        </div>
      </form>
    </BaseModal>
  )
}