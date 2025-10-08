'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import BaseModal, { ModalContent, ModalFooter } from '@/components/ui/BaseModal'
import FormField, { FormInput, FormSelect } from '@/components/ui/FormField'
import { getModalColors } from '@/components/ui/modal-tokens'
import { Shapes } from 'lucide-react'

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

// Tipo para moldura serializada
type SerializedMolding = {
  id: number
  name: string
  quality: 'SIMPLE' | 'FINA' | 'BASTIDOR'
  thicknessId: number
  pricePerM: number
  validFrom: Date
  isActive: boolean
  companyId: number
  thickness: {
    id: number
    name: string
  }
}

interface Props {
  open: boolean
  molding: SerializedMolding
  onClose: () => void
  onSuccess: () => void
  companyId: number
}

export default function EditMoldingModal({ open, molding, onClose, onSuccess, companyId }: Props) {
  const [loading, setLoading] = useState(false)
  const [thicknesses, setThicknesses] = useState<ThicknessOption[]>([])
  const [loadingThicknesses, setLoadingThicknesses] = useState(false)
  const colors = getModalColors('molding')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<MoldingFormData>({
    resolver: zodResolver(moldingSchema),
    defaultValues: {
      name: molding.name,
      quality: molding.quality,
      thicknessId: molding.thicknessId,
      pricePerM: molding.pricePerM
    },
    mode: 'onChange'
  })

  // Reset form when molding changes
  useEffect(() => {
    reset({
      name: molding.name,
      quality: molding.quality,
      thicknessId: molding.thicknessId,
      pricePerM: molding.pricePerM
    })
  }, [molding, reset])

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
      const response = await fetch(`/api/pricing/moldings/${molding.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          companyId
        })
      })

      if (response.ok) {
        toast.success('Moldura actualizada correctamente')
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar la moldura')
      }
    } catch (error) {
      toast.error('Error al actualizar la moldura')
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
      title="Editar Moldura"
      description="Modifica los datos de la moldura seleccionada"
      icon={<Shapes className={`h-5 w-5 ${colors.primary}`} />}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent>
          <div className="space-y-6">
            {/* Moldura Icon */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border-2 border-amber-200">
                <Shapes className="w-10 h-10 text-amber-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <FormField
                  label="Nombre de la Moldura"
                  required
                  error={errors.name?.message}
                  description="Nombre descriptivo y único para la moldura"
                >
                  <FormInput
                    {...register('name')}
                    placeholder="Ej: Moldura Clásica 2cm, Marco Moderno Slim"
                    error={!!errors.name}
                    disabled={loading}
                  />
                </FormField>
              </div>

              <FormField
                label="Calidad"
                required
                error={errors.quality?.message}
                description="Nivel de calidad del material"
              >
                <FormSelect
                  {...register('quality')}
                  error={!!errors.quality}
                  disabled={loading}
                >
                  <option value="">Seleccionar calidad</option>
                  {QUALITIES.map((quality) => (
                    <option key={quality.value} value={quality.value}>
                      {quality.label}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              <FormField
                label="Espesor"
                required
                error={errors.thicknessId?.message}
                description={loadingThicknesses ? "Cargando espesores..." : "Grosor del material"}
              >
                <FormSelect
                  {...register('thicknessId', { valueAsNumber: true })}
                  error={!!errors.thicknessId}
                  disabled={loading || loadingThicknesses}
                >
                  <option value="">Seleccionar espesor</option>
                  {thicknesses.map((thickness) => (
                    <option key={thickness.id} value={thickness.id}>
                      {thickness.name}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              <div className="sm:col-span-2">
                <FormField
                  label="Precio por Metro (S/)"
                  required
                  error={errors.pricePerM?.message}
                  description="Precio de venta por metro lineal"
                >
                  <FormInput
                    type="number"
                    step="0.01"
                    min="0"
                    max="9999.99"
                    {...register('pricePerM', { valueAsNumber: true })}
                    placeholder="0.00"
                    error={!!errors.pricePerM}
                    disabled={loading}
                  />
                </FormField>
              </div>
            </div>

            {/* Información de la moldura */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Información</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>ID: #{molding.id}</div>
                <div>Empresa: #{molding.companyId}</div>
                <div>Creado: {new Date(molding.validFrom).toLocaleDateString()}</div>
                <div>Estado: {molding.isActive ? 'Activo' : 'Inactivo'}</div>
              </div>
            </div>
          </div>
        </ModalContent>
        
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!isValid}
            className={colors.bg}
          >
            Actualizar Moldura
          </Button>
        </ModalFooter>
      </form>
    </BaseModal>
  )
}