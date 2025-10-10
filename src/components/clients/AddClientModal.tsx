'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { TwoStepClientForm } from '@/components/forms/TwoStepClientForm'
import { ClientFormValues } from '@/lib/validators/clienteSchema'

interface Props {
  onSuccess: (client: ClientFormValues & { id: number }) => void
  searchTerm?: string
}

export default function AddClientModal({ onSuccess, searchTerm }: Props) {
  const [open, setOpen] = useState(!!searchTerm)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white
            px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          <Plus size={16} /> Cliente
        </button>
      </Dialog.Trigger>

      <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

      <Dialog.Content
        className="fixed z-50 bg-white max-w-sm w-[90%] 
                   max-h-[85vh] overflow-y-auto overflow-x-hidden left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   animate-in fade-in-90 zoom-in-90 rounded-lg shadow-xl"
      >
        {/* Header minimalista */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 mb-6">
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-lg font-semibold text-gray-900 truncate pr-2">
              Nuevo cliente
              {searchTerm && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  • {searchTerm}
                </span>
              )}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-lg flex-shrink-0">&times;</button>
            </Dialog.Close>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="px-4 pb-4">
          <TwoStepClientForm
            searchTerm={searchTerm}
            isInModal={true}
            onSuccess={(client: ClientFormValues & { id: number }) => {
              setOpen(false)
              onSuccess(client)
            }}
          />
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
