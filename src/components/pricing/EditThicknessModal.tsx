'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import BaseModal from '@/components/ui/BaseModal'
import FormField, { FormInput } from '@/components/ui/FormField'
import InfoCard, { Badge } from '@/components/ui/InfoCard'
import { getModalColors } from '@/components/ui/modal-tokens'
import { Ruler } from 'lucide-react'
import { PricingThickness } from '@prisma/client'

const thicknessSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(50, 'Máximo 50 caracteres')
    .trim()
    .refine(
      (val) => /^\d+(\.\d+)?\s*(mm|cm|m)?$/i.test(val.replace(/\s+/g, '')),
      'Formato inválido. Ej: 2mm, 3.5mm, 10mm'
    )
})

type ThicknessFormData = z.infer<typeof thicknessSchema>

interface Props {
  open: boolean
  thickness: PricingThickness
  onClose: () => void
  onSuccess: () => void
  companyId: number
}

export default function EditThicknessModal({ open, thickness, onClose, onSuccess, companyId }: Props) {
  const [loading, setLoading] = useState(false)
  const colors = getModalColors('default')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ThicknessFormData>({
    resolver: zodResolver(thicknessSchema),
    mode: 'onChange',
    defaultValues: {
      name: thickness.name
    }
  })

  // Reset form when thickness changes
  useEffect(() => {
    reset({
      name: thickness.name
    })
  }, [thickness, reset])

  const onSubmit = async (data: ThicknessFormData) => {
    if (!companyId) {
      toast.error('No se ha seleccionado una empresa')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/pricing/thicknesses/${thickness.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          companyId
        })
      })

      if (response.ok) {
        toast.success('Espesor actualizado correctamente')
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar el espesor')
      }
    } catch (error) {
      toast.error('Error al actualizar el espesor')
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
      title="Editar Espesor"
      description={`Modificar espesor: ${thickness.name}`}
      icon={<Ruler size={20} className={colors.primary} />}
      size="md"
      showCloseButton
    >
      {/* Metadata */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoCard 
            label="ID del Espesor" 
            value={thickness.id} 
          />
          <InfoCard 
            label="Estado" 
            value={<Badge variant="success">Activo</Badge>} 
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
        <FormField
          label="Nombre del Espesor"
          required
          description="Especifica el grosor con unidad (ej: 3mm, 6mm, 10mm)"
          error={errors.name?.message}
        >
          <FormInput
            {...register('name')}
            type="text"
            placeholder="Ej: 3mm, 6mm, 10mm"
            disabled={loading}
            error={!!errors.name}
          />
        </FormField>

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
            <span>Actualizar Espesor</span>
          </button>
        </div>
      </form>
    </BaseModal>
  )
}