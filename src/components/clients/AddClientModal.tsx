'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ClientForm } from '@/components/forms/ClienteForm'
import { ClientFormValues } from '@/lib/validators/clienteSchema'

interface Props {
  onSuccess: (client: ClientFormValues & { id: number }) => void
}

export default function AddClientModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)

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
        className="fixed z-50 bg-white max-w-lg w-[90%] p-6 rounded-xl shadow-xl
                   left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   animate-in fade-in-90 zoom-in-90"
      >
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-xl font-bold">Nuevo cliente</Dialog.Title>

          <Dialog.Close asChild>
            <button className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer">&times;</button>
          </Dialog.Close>
        </div>

        <ClientForm
          onSuccess={(client) => {
            setOpen(false)
            onSuccess(client)
          }}
        />
      </Dialog.Content>
    </Dialog.Root>
  )
}
