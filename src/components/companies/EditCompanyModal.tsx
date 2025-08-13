'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Company } from '@prisma/client';
import CompanyForm from './CompanyForm';


/* ---------- Props ---------- */
interface EditCompanyModalProps {
  company: Company;
  /** Cualquier elemento que actúe como disparador (ej. un <Button>) */
  children: React.ReactNode;
}

/**
 * Modal de edición de empresa.
 * Reutiliza `CompanyForm` con `initialData` y cierra el diálogo al guardar.
 */
export default function EditCompanyModal({
  company,
  children,
}: EditCompanyModalProps) {
  const [open, setOpen] = useState(false);

  // Función auxiliar para limpiar los campos null → undefined
function sanitizeCompanyData(company: Company) {
  const clean: Record<string, any> = {};

  for (const key in company) {
    const value = company[key as keyof Company];
    clean[key] = value === null ? undefined : value;
  }

  return clean;
}

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Disparador recibido como children */}
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Editar empresa
          </Dialog.Title>

          <CompanyForm
            initialData={sanitizeCompanyData(company)}
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)} // ✅ esto cierra el modal al cancelar
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
