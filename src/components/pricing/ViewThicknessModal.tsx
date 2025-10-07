'use client'

import { Button } from '@/components/ui/Button'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { PricingThickness } from '@prisma/client'

interface Props {
  open: boolean
  thickness: PricingThickness
  onClose: () => void
}

export default function ViewThicknessModal({ open, thickness, onClose }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Detalles del Espesor
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  ID
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  #{thickness.id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Nombre
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  {thickness.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Empresa ID
                </label>
                <p className="text-sm text-gray-900">
                  {thickness.companyId}
                </p>
              </div>


            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}