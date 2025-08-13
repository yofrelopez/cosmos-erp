'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import CompanyForm from './CompanyForm';
import { Button } from '../ui/Button';

export default function AddCompanyModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button action="add" size="lg">Nueva empresa</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Registrar empresa
          </Dialog.Title>
          
          <CompanyForm
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)} // ✅ esta línea permite cerrar con el botón Cancelar
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

