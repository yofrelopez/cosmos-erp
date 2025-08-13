'use client';

import { useEffect, useState } from 'react';
import { BankAccount } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import AddBankAccountModal from '../modals/AddBankAccountModal';
import EditBankAccountModal from '../modals/EditBankAccountModal';

import { toast } from 'sonner';                 // 👈 NUEVO




interface Props {
  companyId: number;
}

export default function BankAccountsTab({ companyId }: Props) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null); // 👈 NUEVO

  const [editOpen, setEditOpen] = useState(false);
const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);


  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bank-accounts?companyId=${companyId}`);
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error('Error al obtener cuentas bancarias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setSelectedAccount(account);
    setEditOpen(true);
  };

  // 👇 NUEVO: eliminar
const handleDelete = async (account: BankAccount) => {
  toast(`¿Eliminar la cuenta ${account.bank} • ${account.number}?`, {
    position: 'top-center', // 📌 centrado solo para esta confirmación
    action: {
      label: 'Eliminar',
      onClick: async () => {
        try {
          setDeletingId(account.id);
          const res = await fetch(`/api/bank-accounts/${account.id}`, { method: 'DELETE' });
          const payload = await res.json().catch(() => ({}));

          if (!res.ok) {
            console.error('DELETE /bank-accounts error:', payload);
            toast.error(payload?.error || 'No se pudo eliminar la cuenta');
            return;
          }

          // 🔹 Eliminación optimista
          setAccounts((prev) => prev.filter((a) => a.id !== account.id));
          toast.success('Cuenta eliminada');
        } catch (e) {
          console.error(e);
          toast.error('Error inesperado al eliminar');
        } finally {
          setDeletingId(null);
        }
      },
    },
    cancel: { label: 'Cancelar', onClick: () => {} },
  });
};


  useEffect(() => {
    fetchAccounts();
  }, [companyId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Cuentas registradas</h2>
        <Button action="add" onClick={() => setShowModal(true)}>
          Agregar cuenta
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando cuentas bancarias...</p>
      ) : accounts.length === 0 ? (
        <p className="text-gray-500">No hay cuentas registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Banco</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Moneda</th>
                <th className="px-4 py-2 text-left">Número</th>
                <th className="px-4 py-2 text-left">CCI</th>
                <th className="px-4 py-2 text-left">Alias</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-t">
                  <td className="px-4 py-2">{account.bank}</td>
                  <td className="px-4 py-2">{account.accountType}</td>
                  <td className="px-4 py-2">{account.currency}</td>
                  <td className="px-4 py-2">{account.number}</td>
                  <td className="px-4 py-2">{account.cci || '-'}</td>
                  <td className="px-4 py-2">{account.alias || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">

                    <div className="inline-flex items-center gap-2">
                      <Button
                        action="edit"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      />

                      <Button
                        action="delete"
                        variant='outline'
                        size="sm"
                        loading={deletingId === account.id}
                        onClick={() => handleDelete(account)}
                      />
                    </div>


                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddBankAccountModal
          companyId={companyId}
          open={showModal}
          onOpenChange={setShowModal}
          onSuccess={fetchAccounts}
        />
      )}

      {selectedAccount && (
        <EditBankAccountModal
          open={editOpen}
          onOpenChange={setEditOpen}
          account={selectedAccount}
          onSuccess={fetchAccounts} // vuelve a cargar cuentas si es necesario
        />
      )}


    </div>
  );
}
