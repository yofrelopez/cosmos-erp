'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import BaseModal, { ModalContent, ModalFooter } from '@/components/ui/BaseModal'
import { getModalColors, type ModalType } from '@/components/ui/modal-tokens'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: ModalType
  loading?: boolean
  icon?: React.ReactNode
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'default',
  loading = false,
  icon
}: ConfirmModalProps) {
  const colors = getModalColors(type)

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      size="sm"
    >
      <ModalContent>
        <p className="text-sm text-gray-600 leading-relaxed">
          {message}
        </p>
      </ModalContent>
      
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          loading={loading}
          className={colors.bg}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </BaseModal>
  )
}