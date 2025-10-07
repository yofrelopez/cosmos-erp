'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PricingAccessory } from '@prisma/client'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

// Tipo para accesorios con precio serializado
type SerializedAccessory = Omit<PricingAccessory, 'price'> & {
  price: number
}

const accessorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  price: z.number().positive('El precio debe ser mayor a 0'),
})

type AccessoryFormData = z.infer<typeof accessorySchema>

interface Props {
  open: boolean
  accessory: SerializedAccessory
  onClose: () => void
  onSuccess: () => void
}

export default function EditAccessoryModal({ open, accessory, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const companyId = useCompanyStore((s) => s.company?.id)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<AccessoryFormData>({
    resolver: zodResolver(accessorySchema),
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (accessory) {
      setValue('name', accessory.name)
      setValue('price', accessory.price) // Ya es number
    }
  }, [accessory, setValue])

  const onSubmit = async (data: AccessoryFormData) => {
    if (!companyId) {
      toast.error('Selecciona una empresa')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/pricing/accessories/${accessory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          companyId,
        }),
      })

      if (res.ok) {
        toast.success('Accesorio actualizado correctamente')
        onSuccess()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Error al actualizar el accesorio')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Editar Accesorio
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Accesorio
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ej: Gancho, Parante, etc."
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Precio (S/)
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                className="flex-1"
              >
                Actualizar
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}