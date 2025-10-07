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

const QUALITIES = [
  { value: 'SIMPLE', label: 'Simple' },
  { value: 'FINA', label: 'Fina' },
  { value: 'BASTIDOR', label: 'Bastidor' }
]

const moldingSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  quality: z.enum(['SIMPLE', 'FINA', 'BASTIDOR'], { message: 'La calidad es requerida' }),
  thicknessId: z.number().int().positive('Debe seleccionar un espesor'),
  pricePerM: z.number().positive('El precio debe ser mayor a 0'),
})

type MoldingFormData = z.infer<typeof moldingSchema>

interface ThicknessOption {
  id: number
  name: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  companyId: number
}

export default function AddMoldingModal({ open, onClose, onSuccess, companyId }: Props) {
  const [loading, setLoading] = useState(false)
  const [thicknesses, setThicknesses] = useState<ThicknessOption[]>([])
  const [loadingThicknesses, setLoadingThicknesses] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MoldingFormData>({
    resolver: zodResolver(moldingSchema)
  })

  // Cargar espesores disponibles
  useEffect(() => {
    if (open && companyId) {
      loadThicknesses()
    }
  }, [open, companyId])

  const loadThicknesses = async () => {
    setLoadingThicknesses(true)
    try {
      const res = await fetch(`/api/pricing/thicknesses?companyId=${companyId}`)
      if (res.ok) {
        const data = await res.json()
        setThicknesses(data)
      }
    } catch (error) {
      console.error('Error loading thicknesses:', error)
      toast.error('Error al cargar los espesores')
    } finally {
      setLoadingThicknesses(false)
    }
  }

  const onSubmit = async (data: MoldingFormData) => {
    if (!companyId) {
      toast.error('No se ha seleccionado una empresa')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/pricing/moldings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          companyId
        })
      })

      if (response.ok) {
        toast.success('Moldura creada correctamente')
        reset()
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear la moldura')
      }
    } catch (error) {
      toast.error('Error al crear la moldura')
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
              Nueva Moldura
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
                  Nombre de la Moldura *
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ingrese el nombre de la moldura"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="quality" className="block text-sm font-medium text-gray-700">
                  Calidad *
                </label>
                <select
                  id="quality"
                  {...register('quality')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar calidad</option>
                  {QUALITIES.map((quality) => (
                    <option key={quality.value} value={quality.value}>
                      {quality.label}
                    </option>
                  ))}
                </select>
                {errors.quality && (
                  <p className="text-sm text-red-600">{errors.quality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="thicknessId" className="block text-sm font-medium text-gray-700">
                  Espesor *
                </label>
                <select
                  id="thicknessId"
                  {...register('thicknessId', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingThicknesses}
                >
                  <option value="">Seleccionar espesor</option>
                  {thicknesses.map((thickness) => (
                    <option key={thickness.id} value={thickness.id}>
                      {thickness.name}
                    </option>
                  ))}
                </select>
                {loadingThicknesses && (
                  <p className="text-xs text-gray-500">Cargando espesores...</p>
                )}
                {errors.thicknessId && (
                  <p className="text-sm text-red-600">{errors.thicknessId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="pricePerM" className="block text-sm font-medium text-gray-700">
                  Precio por metro (S/) *
                </label>
                <Input
                  id="pricePerM"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('pricePerM', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.pricePerM && (
                  <p className="text-sm text-red-600">{errors.pricePerM.message}</p>
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
                  Crear Moldura
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}