'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { BankAccount } from '@prisma/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import BankAccountForm from '../form/BankAccountForm';
import { BankAccountSchema } from '@/forms/company/bankSchema';



interface Props {
  /** Cuenta bancaria a editar  */
  account: BankAccount;
  /** Control externo de apertura ↔ cierre */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback para refrescar la lista en el tab */
  onSuccess: () => void;
}

/* -------------------------------------------------------------------------- */
/*                         Modal para editar cuenta                           */
/* -------------------------------------------------------------------------- */
export default function EditBankAccountModal({
  account,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  /* ---------------------------- PATCH handler ---------------------------- */
    const handleUpdate = async (data: BankAccountSchema): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bank-accounts/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err?.error || 'Error al actualizar');
        return;
      }

      toast.success('Cuenta actualizada');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  //* -------------------------- mapear datos al formulario -------------------------- */
  
  function mapToFormDefaults(account: BankAccount): BankAccountSchema {
  return {
    bank: account.bank,
    accountType: account.accountType,
    alias: account.alias ?? '',
    number: account.number,
    cci: account.cci ?? '',
    currency: account.currency as 'PEN' | 'USD',
    companyId: account.companyId,
  };
}


  /* ---------------------------------------------------------------------- */
  /*                                   UI                                   */
  /* ---------------------------------------------------------------------- */
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed z-50 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl
                     top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     focus:outline-none"
        >
          {/* Botón cerrar */}
          <Dialog.Close
            asChild
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X size={20} aria-label="Cerrar" />
          </Dialog.Close>

          <Dialog.Title className="text-lg font-bold mb-4">
            Editar cuenta bancaria
          </Dialog.Title>

          {/* Form reutilizable */}
          <BankAccountForm
            defaultValues={mapToFormDefaults(account)} // Mapea los datos de la cuenta
            onSubmit={handleUpdate}
            loading={loading}
            onCancel={() => onOpenChange(false)}
            /* Ejemplo: si no quieres que cambien la moneda */
            // disabledFields={['currency']}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
