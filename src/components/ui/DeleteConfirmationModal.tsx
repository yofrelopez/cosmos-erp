'use client'

import { Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import BaseModal, { ModalContent, ModalFooter } from '@/components/ui/BaseModal'
import { getModalColors } from '@/components/ui/modal-tokens'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  itemName: string
  itemType: string
  loading?: boolean
  warningMessage?: string
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  loading = false,
  warningMessage
}: DeleteConfirmationModalProps) {
  const colors = getModalColors('default')

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
      size="md"
    >
      <ModalContent>
        <div className="space-y-4">
          {/* Icono de alerta */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-200">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Mensaje principal */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              ¿Eliminar {itemType}?
            </h3>
            <p className="text-gray-600">
              Estás a punto de eliminar <strong>"{itemName}"</strong>
            </p>
          </div>

          {/* Mensaje de advertencia */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Esta acción no se puede deshacer</p>
                <p>
                  {warningMessage || 
                    `${itemType} será eliminado permanentemente del sistema y no podrá ser recuperado.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          loading={loading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </ModalFooter>
    </BaseModal>
  )
}