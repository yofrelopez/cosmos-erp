// src/components/pricing/EditPricingGlassBaseModal.tsx
'use client'

import { PricingGlassBaseFormValues } from '@/forms/PricingGlassBaseForm'
import PricingGlassBaseForm from '@/forms/PricingGlassBaseForm'


import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'


type Item = {
  id: number
  companyId: number
  family: string
  thicknessMM: string
  pricePerFt2: string
  minBillableFt2?: string | null
  minCharge?: string | null
  validFrom: string
  isActive: boolean
}

type Props = {
  itemId: number
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditPricingGlassBaseModal({
  itemId,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<Item | null>(null)

  useEffect(() => {
    if (!open || !itemId) return
    setLoading(true)
    fetch(`/api/pricing/pricing-glass-base/${itemId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Item) => setItem(data))
      .catch(() => {
        setItem(null)
        toast.error('No se pudo cargar el registro')
      })
      .finally(() => setLoading(false))
  }, [open, itemId])

  const initialData: Partial<PricingGlassBaseFormValues> | undefined = item
    ? {
        family: item.family as any,
        thicknessMM: Number(item.thicknessMM),
        pricePerFt2: Number(item.pricePerFt2),
        minBillableFt2: item.minBillableFt2 ? Number(item.minBillableFt2) : undefined,
        minCharge: item.minCharge ? Number(item.minCharge) : undefined,
        validFrom: item.validFrom?.slice(0, 10),
        isActive: item.isActive,
      }
    : undefined

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed z-50 bg-white max-w-2xl w-[92%] p-6 rounded-2xl shadow-2xl
                     left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg md:text-xl font-semibold">
              Editar precio base
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700 text-xl leading-none">
                &times;
              </button>
            </Dialog.Close>
          </div>

          {loading ? (
            <p className="text-gray-500">Cargando…</p>
          ) : item ? (
            <PricingGlassBaseForm
              initialData={initialData}
              onCancel={onClose}
              onSubmitOverride={async (values, companyId) => {
                const res = await fetch(`/api/pricing/pricing-glass-base/${item?.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    family: values.family,
                    thicknessMM: values.thicknessMM,
                    pricePerFt2: values.pricePerFt2,
                    minBillableFt2: values.minBillableFt2,
                    minCharge: values.minCharge,
                    validFrom: values.validFrom ? new Date(values.validFrom) : undefined,
                    isActive: values.isActive ?? true,
                    companyId: companyId,
                  }),
                })
                if (res.status === 409) {
                  toast.error(
                    'Duplicado: (empresa, familia, espesor, fecha desde) ya existe.'
                  )
                  throw new Error('duplicado')
                }
                if (!res.ok) {
                  toast.error('No se pudo actualizar')
                  throw new Error('fail')
                }
              }}
              onSuccess={onSuccess}
            />
          ) : (
            <p className="text-red-600">No se encontró el registro.</p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
