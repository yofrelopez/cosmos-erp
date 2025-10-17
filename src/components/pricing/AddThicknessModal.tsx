'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import BaseModal, { ModalContent, ModalFooter } from '@/components/ui/BaseModal'
import FormField, { FormInput } from '@/components/ui/FormField'
import { getModalColors } from '@/components/ui/modal-tokens'
import { Ruler } from 'lucide-react'

const thicknessSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(50, 'Máximo 50 caracteres')
    .trim()
    .refine(
      (val) => /^[a-zA-Z0-9\s\.]+$/i.test(val),
      'Solo se permiten letras, números, espacios y puntos'
    )
})

type ThicknessFormData = z.infer<typeof thicknessSchema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  companyId: number
}

export default function AddThicknessModal({ open, onClose, onSuccess, companyId }: Props) {
  const [loading, setLoading] = useState(false)
  const colors = getModalColors('default')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ThicknessFormData>({
    resolver: zodResolver(thicknessSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: ThicknessFormData) => {
    if (!companyId) {
      toast.error('No se ha seleccionado una empresa')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/pricing/thicknesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          companyId
        })
      })

      if (response.ok) {
        toast.success('Espesor creado correctamente')
        reset()
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear el espesor')
      }
    } catch (error) {
      toast.error('Error al crear el espesor')
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
      title="Agregar Espesor"
      description="Crear un nuevo espesor para molduras"
      icon={<Ruler size={20} className={colors.primary} />}
      size="sm"
      showCloseButton
    >
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <FormField
          label="Nombre del Espesor"
          required
          description="Nombre descriptivo del espesor (ej: 3mm, 6mm, Grueso A, Tipo 1)"
          error={errors.name?.message}
        >
          <FormInput
            {...register('name')}
            type="text"
            placeholder="Ej: 3mm, Grueso A, Tipo 1"
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
            <span>Crear Espesor</span>
          </button>
        </div>
      </form>
    </BaseModal>
  )
}