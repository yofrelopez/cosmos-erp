'use client'

import * as Dialog from '@radix-ui/react-dialog'
import type { Client } from '@prisma/client'

interface ViewClientModalProps {
  client: Client
  open: boolean
  onClose: () => void
}

export default function ViewClientModal({ client, open, onClose }: ViewClientModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed z-50 bg-white max-w-md w-[92%] p-6 rounded-2xl shadow-2xl
                     left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     animate-in fade-in-90 zoom-in-90"
        >
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-800">
              Detalles del cliente
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                &times;
              </button>
            </Dialog.Close>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-sky-400" />

            <div className="px-5 py-6 space-y-6">
              <section>
                <h3 className="text-sm font-medium text-gray-500 tracking-wide">
                  Nombre / Razón social
                </h3>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {client.fullName || client.businessName}
                </p>
              </section>

              <section className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <Field label="Documento">
                  {client.documentType} {client.documentNumber}
                </Field>
                <Field label="Teléfono">{client.phone || '—'}</Field>
                <Field label="Correo electrónico">{client.email || '—'}</Field>
                <Field label="Dirección" full>
                  {client.address || '—'}
                </Field>
                <Field label="Notas" full>
                  {client.notes || '—'}
                </Field>
                <Field label="Registrado el" full>
                  {new Date(client.createdAt).toLocaleString()}
                </Field>
              </section>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface FieldProps {
  label: string
  children: React.ReactNode
  full?: boolean
}
function Field({ label, children, full }: FieldProps) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-gray-500">{label}</p>
      <p className="text-gray-800 break-words">{children}</p>
    </div>
  )
}
