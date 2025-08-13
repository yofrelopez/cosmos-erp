'use client';

import { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCompanyStore } from '@/lib/store/useCompanyStore';
import { Trash2 } from 'lucide-react';

interface Props {
  id: number;
  name: string;
}

/**
 * Diálogo de confirmación + eliminación con toasts elegantes.
 */
export default function DeleteCompanyDialog({ id, name }: Props) {
  const [open, setOpen] = useState(false);
  const { removeCompany } = useCompanyStore();

  async function handleDelete() {
    toast.promise(
      fetch(`/api/empresas/${id}`, { method: 'DELETE' })
        .then(async (res) => {
          const json = await res.json();

          if (!res.ok) {
            // Lanza el mensaje que envía el backend (json.error) o uno genérico
            throw new Error(json.error || 'Error al eliminar');
          }

          removeCompany(id);
        }),
      {
        loading: 'Eliminando…',
        success: `Empresa «${name}» eliminada`,
        error: (err) => err.message, // mostrará el mensaje del backend
      }
    );
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <Button action="delete" variant="outline">Eliminar</Button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6">
          <AlertDialog.Title className="text-lg font-semibold">
            ¿Eliminar empresa?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            Esta acción no se puede deshacer. Se eliminará toda la información
            relacionada con «{name}».
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button action='cancel'>Cancelar</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button action='delete' onClick={handleDelete}>
                Sí, eliminar
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
