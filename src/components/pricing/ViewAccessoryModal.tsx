'use client'

import { PricingAccessory } from '@prisma/client'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Tipo para accesorios con precio serializado
type SerializedAccessory = Omit<PricingAccessory, 'price'> & {
  price: number
}

interface Props {
  open: boolean
  accessory: SerializedAccessory
  onClose: () => void
}

export default function ViewAccessoryModal({ open, accessory, onClose }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Detalles del Accesorio
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                {accessory.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                S/ {accessory.price.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  accessory.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {accessory.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vigente desde
                </label>
                <p className="text-gray-900 text-sm">
                  {new Date(accessory.validFrom).toLocaleDateString()}
                </p>
              </div>
            </div>

            {accessory.validTo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vigente hasta
                </label>
                <p className="text-gray-900 text-sm">
                  {new Date(accessory.validTo).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <label className="block font-medium mb-1">Creado</label>
                <p>{new Date(accessory.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block font-medium mb-1">Actualizado</label>
                <p>{new Date(accessory.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}