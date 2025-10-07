'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { SerializedPricingGlass } from '@/types/newTypes'

interface Props {
  open: boolean
  onClose: () => void
  glass: SerializedPricingGlass
}

const GLASS_FAMILIES_LABELS = {
  'PLANO': 'Plano',
  'CATEDRAL': 'Catedral',
  'TEMPLADO': 'Templado',
  'ESPEJO': 'Espejo'
}

const GLASS_COLOR_TYPES_LABELS = {
  'INCOLORO': 'Incoloro',
  'COLOR': 'Color',
  'POLARIZADO': 'Polarizado'
}

export default function ViewGlassModal({ open, onClose, glass }: Props) {
  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`
  }

  const getFamilyLabel = (family: string) => {
    return GLASS_FAMILIES_LABELS[family as keyof typeof GLASS_FAMILIES_LABELS] || family
  }

  const getColorDisplay = () => {
    const colorTypeLabel = GLASS_COLOR_TYPES_LABELS[glass.colorType as keyof typeof GLASS_COLOR_TYPES_LABELS] || glass.colorType
    if (glass.colorName) {
      return `${colorTypeLabel} (${glass.colorName})`
    }
    return colorTypeLabel
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Detalles del Vidrio
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID
              </label>
              <p className="text-gray-900">{glass.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Comercial
              </label>
              <p className="text-gray-900 font-medium">{glass.commercialName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Familia
              </label>
              <p className="text-gray-900">{getFamilyLabel(glass.family)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Espesor
              </label>
              <p className="text-gray-900">{glass.thicknessMM} mm</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <p className="text-gray-900">{getColorDisplay()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <p className="font-semibold text-green-600 text-lg">
                {formatPrice(glass.price)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vigente desde
              </label>
              <p className="text-gray-900">
                {new Date(glass.validFrom).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {glass.validTo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vigente hasta
                </label>
                <p className="text-gray-900">
                  {new Date(glass.validTo).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                glass.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {glass.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Creación
              </label>
              <p className="text-gray-900">
                {new Date(glass.createdAt).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Última Actualización
              </label>
              <p className="text-gray-900">
                {new Date(glass.updatedAt).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={onClose} variant="outline">
                Cerrar
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}