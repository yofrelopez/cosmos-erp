'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCompanyStore } from '@/lib/store/useCompanyStore';
import { Ban, AlertTriangle } from 'lucide-react';

interface Props {
  id: number;
  name: string;
}

/**
 * Diálogo de confirmación para desactivar empresa (no eliminar físicamente).
 */
export default function DeleteCompanyDialog({ id, name }: Props) {
  const [loading, setLoading] = useState(false);
  const { removeCompany } = useCompanyStore();

  async function handleDeactivate() {
    setLoading(true);
    
    try {
      const res = await fetch(`/api/empresas/${id}/deactivate`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Error al desactivar empresa');
      }

      removeCompany(id);
      toast.success(`Empresa "${name}" desactivada correctamente`, {
        description: 'La empresa ya no aparecerá en las listas pero sus datos se conservan'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al desactivar empresa';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleClick = () => {
    toast(
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={16} className="text-orange-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">¿Desactivar empresa?</h4>
          <p className="text-sm text-gray-600 mt-1">
            La empresa "{name}" quedará inactiva pero no se eliminarán sus datos. Podrás reactivarla después si es necesario.
          </p>
        </div>
      </div>,
      {
        duration: 10000,
        action: {
          label: 'Desactivar',
          onClick: handleDeactivate
        },
        cancel: {
          label: 'Cancelar',
          onClick: () => {}
        }
      }
    );
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      title="Desactivar empresa"
    >
      <Ban size={16} />
    </button>
  );
}
