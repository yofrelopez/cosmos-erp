'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ClientForm } from '@/components/forms/ClienteForm'
import type { Client } from '@prisma/client'

interface EditClientModalProps {
  client: Client
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditClientModal({ client, open, onClose, onSuccess }: EditClientModalProps) {
  const initialData = {
    id: client.id,
    createdAt: client.createdAt,
    documentType: client.documentType as 'DNI' | 'RUC' | 'CE',
    documentNumber: client.documentNumber,
    fullName: client.fullName,
    businessName: client.businessName ?? '',
    phone: client.phone ?? '',
    email: client.email ?? '',
    address: client.address ?? '',
    notes: client.notes ?? '',
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed z-50 bg-white max-w-lg w-[90%] p-6 rounded-xl shadow-xl
                     left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     animate-in fade-in-90 zoom-in-90"
        >
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">Editar cliente</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </Dialog.Close>
          </div>

          <ClientForm initialData={initialData} onSuccess={onSuccess} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
