'use client';

import { useEffect, useState } from 'react';
import { Wallet } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Smartphone, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  companyId: number;
}

export default function WalletsTab({ companyId }: Props) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/wallets?companyId=${companyId}`);
      const data = await res.json();
      setWallets(data);
    } catch (err) {
      console.error('Error al obtener billeteras digitales:', err);
      toast.error('Error al cargar billeteras digitales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [companyId]);

  const handleDelete = async (wallet: Wallet) => {
    toast(`¿Eliminar la billetera ${wallet.type}?`, {
      position: 'top-center',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          try {
            setDeletingId(wallet.id);
            const res = await fetch(`/api/wallets/${wallet.id}`, { 
              method: 'DELETE' 
            });
            
            if (!res.ok) {
              const error = await res.json().catch(() => ({}));
              throw new Error(error?.message || 'Error al eliminar');
            }

            setWallets(prev => prev.filter(w => w.id !== wallet.id));
            toast.success('Billetera eliminada correctamente');
          } catch (error) {
            console.error('Error:', error);
            toast.error('No se pudo eliminar la billetera');
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => setDeletingId(null),
      },
    });
  };

  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
  };

  const handleSaveEdit = async (updatedData: { type: string; phone: string; qrUrl?: string }) => {
    if (!editingWallet) return;

    try {
      const isCreating = editingWallet.id === 0;
      const url = isCreating ? '/api/wallets' : `/api/wallets/${editingWallet.id}`;
      const method = isCreating ? 'POST' : 'PATCH';
      const payload = isCreating ? { ...updatedData, companyId } : updatedData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || `Error al ${isCreating ? 'crear' : 'actualizar'}`);
      }

      const savedWallet = await res.json();
      
      if (isCreating) {
        setWallets(prev => [...prev, savedWallet]);
        toast.success('Billetera creada correctamente');
      } else {
        setWallets(prev => prev.map(w => w.id === editingWallet.id ? savedWallet : w));
        toast.success('Billetera actualizada correctamente');
      }
      
      setEditingWallet(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error inesperado');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Smartphone size={18} className="text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Billeteras Digitales</h3>
          <p className="text-sm text-gray-500">Gestiona las billeteras digitales de la empresa (YAPE, PLIN)</p>
        </div>
      </div>

      {/* Botón para agregar nueva billetera */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setEditingWallet({ 
            id: 0, 
            type: 'YAPE', 
            phone: '', 
            qrUrl: null, 
            companyId 
          } as Wallet)}
          className="flex items-center gap-2"
          size="sm"
        >
          <Plus size={16} />
          Agregar Billetera
        </Button>
      </div>

      {/* Lista de billeteras */}
      {wallets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Smartphone size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay billeteras digitales</h3>
          <p className="text-gray-500 mb-4">Agrega billeteras digitales para recibir pagos por YAPE o PLIN</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    wallet.type === 'YAPE' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{wallet.type}</h4>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                    title="Editar billetera"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(wallet)}
                    disabled={deletingId === wallet.id}
                    className={`transition-colors p-1 ${
                      deletingId === wallet.id
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                    title="Eliminar billetera"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Información de la billetera */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Teléfono:</span>
                  <span className="font-medium text-gray-900">{wallet.phone}</span>
                </div>
                {wallet.qrUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">QR URL:</span>
                    <span className="font-medium text-gray-900 truncate max-w-32" title={wallet.qrUrl}>
                      {wallet.qrUrl}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor inline */}
      {editingWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingWallet.id === 0 ? 'Nueva Billetera Digital' : `Editar ${editingWallet.type}`}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleSaveEdit({
                type: formData.get('type') as string,
                phone: formData.get('phone') as string,
                qrUrl: formData.get('qrUrl') as string || undefined,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    name="type"
                    defaultValue={editingWallet.type}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="YAPE">YAPE</option>
                    <option value="PLIN">PLIN</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={editingWallet.phone}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="999 123 456"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL del QR (opcional)
                  </label>
                  <input
                    name="qrUrl"
                    type="url"
                    defaultValue={editingWallet.qrUrl || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://ejemplo.com/qr-code.png"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button type="submit" size="sm" action="save" className="flex-1">
                  Guardar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  action="cancel"
                  onClick={() => setEditingWallet(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}