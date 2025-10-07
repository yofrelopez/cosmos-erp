'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<GlassFormData>({
    resolver: zodResolver(glassSchema)
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
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Editar Vidrio
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="commercialName" className="block text-sm font-medium text-gray-700">
                  Nombre Comercial *
                </label>
                <Input
                  id="commercialName"
                  type="text"
                  {...register('commercialName')}
                  placeholder="Ej: Templado 6mm, Doble cristal, etc."
                />
                <p className="text-xs text-gray-500">
                  Solo letras, números, espacios, guiones y puntos. Máximo 100 caracteres.
                </p>
                {errors.commercialName && (
                  <p className="text-sm text-red-600">{errors.commercialName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="family" className="block text-sm font-medium text-gray-700">
                  Familia *
                </label>
                <select
                  id="family"
                  {...register('family')}
                  onChange={(e) => handleFamilyChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar familia</option>
                  {GLASS_FAMILIES.map((family) => (
                    <option key={family.value} value={family.value}>
                      {family.label}
                    </option>
                  ))}
                </select>
                {errors.family && (
                  <p className="text-sm text-red-600">{errors.family.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="thicknessMM" className="block text-sm font-medium text-gray-700">
                  Espesor (mm) *
                </label>
                <Input
                  id="thicknessMM"
                  type="number"
                  step="0.1"
                  min="0"
                  {...register('thicknessMM', { valueAsNumber: true })}
                  placeholder="5.5"
                />
                {errors.thicknessMM && (
                  <p className="text-sm text-red-600">{errors.thicknessMM.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="colorType" className="block text-sm font-medium text-gray-700">
                  Tipo de Color *
                </label>
                <select
                  id="colorType"
                  {...register('colorType')}
                  onChange={(e) => handleColorTypeChange(e.target.value)}
                  disabled={selectedFamily === 'TEMPLADO'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {GLASS_COLOR_TYPES.map((colorType) => (
                    <option key={colorType.value} value={colorType.value}>
                      {colorType.label}
                    </option>
                  ))}
                </select>
                {selectedFamily === 'TEMPLADO' && (
                  <p className="text-sm text-gray-500">Los vidrios templados solo pueden ser lisos (incoloro)</p>
                )}
                {errors.colorType && (
                  <p className="text-sm text-red-600">{errors.colorType.message}</p>
                )}
              </div>



              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Precio (S/) *
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={loading}>
                  Actualizar Vidrio
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}