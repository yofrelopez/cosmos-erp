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

const backingSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  pricePerFt2: z.number().positive('El precio debe ser mayor a 0'),
})

type BackingFormData = z.infer<typeof backingSchema>

// Tipo para soporte con precio serializado
type SerializedBacking = {
  id: number
  name: string
  pricePerFt2: number
  validFrom: Date
  isActive: boolean
  companyId: number
}

interface Props {
  open: boolean
  backing: SerializedBacking
  onClose: () => void
  onSuccess: () => void
  companyId: number
}

export default function EditBackingModal({ open, backing, onClose, onSuccess, companyId }: Props) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BackingFormData>({
    resolver: zodResolver(backingSchema),
    defaultValues: {
      name: backing.name,
      pricePerFt2: backing.pricePerFt2
    }
  })

  // Reset form when backing changes
  useEffect(() => {
    reset({
      name: backing.name,
      pricePerFt2: backing.pricePerFt2
    })
  }, [backing, reset])

  const onSubmit = async (data: BackingFormData) => {
    if (!companyId) {
      toast.error('No se ha seleccionado una empresa')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/pricing/backings/${backing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          companyId
        })
      })

      if (response.ok) {
        toast.success('Soporte actualizado correctamente')
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar el soporte')
      }
    } catch (error) {
      toast.error('Error al actualizar el soporte')
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
              Editar Soporte
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre del Soporte *
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ingrese el nombre del soporte"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="pricePerFt2" className="block text-sm font-medium text-gray-700">
                  Precio por ft² (S/) *
                </label>
                <Input
                  id="pricePerFt2"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('pricePerFt2', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.pricePerFt2 && (
                  <p className="text-sm text-red-600">{errors.pricePerFt2.message}</p>
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
                  Actualizar
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}