// src/components/forms/PricingGlassBaseForm.tsx
'use client'

import { useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PricingGlassFamily } from '@prisma/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { useCompanyStore } from '@/lib/store/useCompanyStore'


/* ---------------- Zod ---------------- */
const FAMILY_VALUES = Object.values(PricingGlassFamily) as [
  PricingGlassFamily,
  ...PricingGlassFamily[]
]
const familySchema = z.enum(FAMILY_VALUES).transform(v => v as PricingGlassFamily)

const schema = z.object({
  family: familySchema,
  thicknessMM: z.coerce.number().positive({ message: 'Ingrese un espesor válido' }),
  pricePerFt2: z.coerce.number().nonnegative({ message: 'Ingrese un precio válido' }),
  validFrom: z.string().optional(),           // YYYY-MM-DD
  isActive: z.boolean().default(true),        // ⬅️ evita "unknown" marcándolo no-optional con default
  minBillableFt2: z.coerce.number().positive().optional(),
  minCharge: z.coerce.number().nonnegative().optional(),
})

export type PricingGlassBaseFormValues = z.infer<typeof schema>

type Props = {
  initialData?: Partial<PricingGlassBaseFormValues>
  onSuccess?: () => void
  onCancel?: () => void
  /** Si se define, reemplaza el POST por defecto (útil para PATCH en edición) */
  onSubmitOverride?: (values: PricingGlassBaseFormValues, companyId: number) => Promise<void>
}

export default function PricingGlassBaseForm({
  initialData,
  onSuccess,
  onCancel,
  onSubmitOverride,
}: Props) {
  const { company } = useCompanyStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PricingGlassBaseFormValues>({
    resolver: zodResolver(schema) as Resolver<PricingGlassBaseFormValues>,
    defaultValues: {
      family: initialData?.family ?? PricingGlassFamily.PLANO,
      thicknessMM: initialData?.thicknessMM,
      pricePerFt2: initialData?.pricePerFt2,
      validFrom: initialData?.validFrom ?? new Date().toISOString().slice(0, 10),
      isActive: initialData?.isActive ?? true,
      minBillableFt2: initialData?.minBillableFt2,
      minCharge: initialData?.minCharge,
    },
  })

  const familyOptions = useMemo(() => FAMILY_VALUES, [])

  if (!company) return <p className="text-gray-500">Selecciona una empresa.</p>

  const onSubmit = async (values: PricingGlassBaseFormValues) => {
    try {
      if (onSubmitOverride) {
        await onSubmitOverride(values, company.id)
      } else {
        const res = await fetch('/api/pricing/pricing-glass-base', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: company.id,
            family: values.family,
            thicknessMM: values.thicknessMM,
            pricePerFt2: values.pricePerFt2,
            minBillableFt2: values.minBillableFt2,
            minCharge: values.minCharge,
            validFrom: values.validFrom ? new Date(values.validFrom) : undefined,
            isActive: values.isActive ?? true,
          }),
        })
        if (res.status === 409) {
          toast.error('Ya existe un registro con (empresa, familia, espesor, fecha desde).')
          return
        }
        if (!res.ok) throw new Error()
      }
      toast.success('Guardado correctamente')
      onSuccess?.()
    } catch {
      toast.error('No se pudo guardar')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Fila 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="family" className="block text-sm font-medium text-gray-700">
            Familia
          </label>
          <select
            id="family"
            {...register('family')}
            disabled={isSubmitting}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          >
            {familyOptions.map(f => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          {errors.family && (
            <p className="text-xs text-red-600 mt-1">{String(errors.family.message)}</p>
          )}
        </div>

        <div>
          <label htmlFor="thicknessMM" className="block text-sm font-medium text-gray-700">
            Espesor (mm)
          </label>
          <input
            id="thicknessMM"
            type="number"
            step="0.1"
            inputMode="decimal"
            {...register('thicknessMM')}
            disabled={isSubmitting}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="p.ej. 5.5"
          />
          {errors.thicknessMM && (
            <p className="text-xs text-red-600 mt-1">{errors.thicknessMM.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="pricePerFt2" className="block text-sm font-medium text-gray-700">
            Precio (por ft²)
          </label>
          <input
            id="pricePerFt2"
            type="number"
            step="0.01"
            inputMode="decimal"
            {...register('pricePerFt2')}
            disabled={isSubmitting}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="p.ej. 45.00"
          />
          {errors.pricePerFt2 && (
            <p className="text-xs text-red-600 mt-1">{errors.pricePerFt2.message}</p>
          )}
        </div>
      </div>

      {/* Fila 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">
            Vigente desde
          </label>
          <input
            id="validFrom"
            type="date"
            {...register('validFrom')}
            disabled={isSubmitting}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end gap-2">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Activo
          </label>
        </div>
      </div>

      {/* Fila 3 opcional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="minBillableFt2" className="block text-sm font-medium text-gray-700">
            Mín. facturable (ft²)
          </label>
          <input
            id="minBillableFt2"
            type="number"
            step="0.01"
            inputMode="decimal"
            {...register('minBillableFt2')}
            disabled={isSubmitting}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="opcional"
          />
        </div>

        <div>
          <label htmlFor="minCharge" className="block text-sm font-medium text-gray-700">
            Cargo mínimo (S/)
          </label>
          <input
            id="minCharge"
            type="number"
            step="0.01"
            inputMode="decimal"
            {...register('minCharge')}
            disabled={isSubmitting}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="opcional"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button action="cancel" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button action="save" type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
