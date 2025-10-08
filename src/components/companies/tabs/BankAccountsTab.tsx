'use client';

import { useEffect, useState } from 'react';
import { BankAccount } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import AddBankAccountModal from '../modals/AddBankAccountModal';
import EditBankAccountModal from '../modals/EditBankAccountModal';
import { CreditCard, Plus } from 'lucide-react';
import { toast } from 'sonner';




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
    <div className="space-y-6">
      {/* Header de sección */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <CreditCard size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cuentas Bancarias</h3>
            <p className="text-sm text-gray-500">
              {accounts.length} {accounts.length === 1 ? 'cuenta registrada' : 'cuentas registradas'}
            </p>
          </div>
        </div>
        
        <Button action="add" onClick={() => setShowModal(true)}>
          Agregar Cuenta
        </Button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Cargando cuentas bancarias...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuentas registradas</h3>
          <p className="text-gray-500 mb-6">Agrega la primera cuenta bancaria de la empresa.</p>
          <Button action="add" onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-2" />
            Agregar Primera Cuenta
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
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
        </div>
      )}

      {/* Modales */}
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
