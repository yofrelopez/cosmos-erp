'use client'

import { Button } from '@/components/ui/Button'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

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
}

export default function ViewBackingModal({ open, backing, onClose }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Detalles del Soporte
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
                  Nombre
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  {backing.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Precio por ft²
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  S/ {backing.pricePerFt2.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Vigente desde
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(backing.validFrom).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Estado
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  backing.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {backing.isActive ? 'Activo' : 'Inactivo'}
                </span>
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