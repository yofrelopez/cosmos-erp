'use client';




import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useState } from 'react';

import { bankAccountSchema, BankAccountSchema } from '@/forms/company/bankSchema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import BankAccountForm from '../form/BankAccountForm';

interface Props {
  companyId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/* -------------------------------------------------------------------------- */
/*                               Modal component                              */
/* -------------------------------------------------------------------------- */
export default function AddBankAccountModal({
  companyId,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankAccountSchema>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bank: '',
      accountType: '',
      alias: '',
      number: '',
      cci: '',
      currency: 'PEN',
      companyId,
    },
  });

  /* -------------------------- submit handler -------------------------- */
  async function onSubmit(data: BankAccountSchema) {
    setLoading(true);
    try {
      const res = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Cuenta registrada correctamente');
        reset();          // limpia el formulario
        onSuccess();      // refresca la lista
        onOpenChange(false);
      } else {
        const err = await res.json();
        toast.error(err.error ?? 'No se pudo registrar la cuenta');
      }
    } catch {
      toast.error('Error inesperado al registrar la cuenta');
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------------------- */
  /*                                Render                                */
  /* -------------------------------------------------------------------- */
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />

        {/* Content */}
        <Dialog.Content
          className="fixed z-50 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl
                     top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     focus:outline-none"
        >
          {/* Close button */}
          <Dialog.Close
            asChild
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X size={20} aria-label="Cerrar" />
          </Dialog.Close>

          <Dialog.Title className="text-lg font-bold mb-4">
            Agregar cuenta bancaria
          </Dialog.Title>

          {/* Form */}


          
          <BankAccountForm
            defaultValues={{ companyId }}          // companyId se incluye pero el input no se ve
            onSubmit={onSubmit}
            loading={loading}
            onCancel={() => onOpenChange(false)}
            />

          
 
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
