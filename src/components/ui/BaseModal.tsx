'use client'

import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl'
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  size = 'md',
  showCloseButton = true,
  className
}: BaseModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "mx-4 max-h-[90vh] overflow-hidden",
          sizeClasses[size],
          className
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {icon && (
                <div className="flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900 leading-6">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 text-sm text-gray-500">
                    {description}
                  </Dialog.Description>
                )}
              </div>
            </div>
            
            {showCloseButton && (
              <Dialog.Close asChild>
                <button 
                  type="button"
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Componente para el contenido del modal con padding estándar
export function ModalContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("p-4 sm:p-6", className)}>
      {children}
    </div>
  )
}

// Componente para el footer del modal
export function ModalFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50", className)}>
      {children}
    </div>
  )
}