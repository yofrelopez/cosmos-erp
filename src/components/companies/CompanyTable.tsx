'use client';

import { useEffect } from 'react';
import { Company } from '@prisma/client';
import { useCompanyStore } from '@/lib/store/useCompanyStore';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

import DeleteCompanyDialog from './crud-dialogo/DeleteCompanyDialog';

/* ---------- Props ---------- */
interface Props {
  /** Lista recibida desde el Server Component */
  initialData: Company[];
}

/**
 * Tabla de empresas con acciones de editar y eliminar.
 * - Hidrata el Zustand store con `initialData` al montar.
 * - Se actualiza en tiempo real gracias a `useCompanyStore`.
 */
export default function CompanyTable({ initialData }: Props) {
  const {
    companies,
    setCompanies,
    removeCompany,
  } = useCompanyStore();

  const router = useRouter();

  /* hidratar store una sola vez */
  useEffect(() => {
    if (companies.length === 0 && initialData.length > 0) {
      setCompanies(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* helper para borrar con confirmación simple */
  async function handleDelete(id: number) {
    const ok = window.confirm('¿Eliminar empresa definitivamente?');
    if (!ok) return;

    const res = await fetch(`/api/empresas/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Error al eliminar'); // reemplaza con toast si tienes
      return;
    }
    removeCompany(id);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-3 font-semibold">Empresa</th>
            <th className="px-4 py-3 font-semibold">RUC</th>
            <th className="px-4 py-3 font-semibold">Teléfono</th>
            <th className="px-4 py-3 font-semibold whitespace-nowrap">Creada</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {companies.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c.ruc}</td>
              <td className="px-4 py-2">{c.phone ?? '—'}</td>
              <td className="px-4 py-2">
                {new Intl.DateTimeFormat('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                }).format(new Date(c.createdAt))}
                </td>

              <td className="px-4 py-2 space-x-2">
                {/* Editar -> navegar */}
                <Button action="edit" onClick={() => router.push(`/empresas/${c.id}/editar`)}>
                  Editar
                </Button>

                {/* Eliminar */}
                <DeleteCompanyDialog id={c.id} name={c.name} />
              </td>
            </tr>
          ))}

          {companies.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                No hay empresas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
