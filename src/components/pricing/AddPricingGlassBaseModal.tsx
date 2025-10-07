// src/components/pricing/AddPricingGlassBaseModal.tsx
'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import PricingGlassBaseForm from '@/forms/PricingGlassBaseForm'

type Props = {
  onSuccess: () => void
}

export default function AddPricingGlassBaseModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button action="add" size="md">Nuevo precio</Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed z-50 bg-white max-w-2xl w-[92%] p-6 rounded-2xl shadow-2xl
                     left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     animate-in fade-in-90 zoom-in-90"
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg md:text-xl font-semibold">
              Nuevo precio base de vidrio
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700 text-xl leading-none">&times;</button>
            </Dialog.Close>
          </div>

          <PricingGlassBaseForm
            onSuccess={() => {
              setOpen(false)
              onSuccess()
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
