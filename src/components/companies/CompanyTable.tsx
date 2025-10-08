'use client';

import { useEffect } from 'react';
import { Company } from '@prisma/client';
import { useCompanyStore } from '@/lib/store/useCompanyStore';
import { useRouter } from 'next/navigation';
import RowActions, { Action } from '@/components/common/RowActions';
import { Building2, Phone, Calendar, Eye, Edit2, Trash2 } from 'lucide-react';
import DeactivateCompanyDialog from './crud-dialogo/DeactivateCompanyDialog';

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

  /* siempre hidratar con datos frescos del servidor */
  useEffect(() => {
    setCompanies(initialData);
  }, [initialData, setCompanies]);

  const getRowActions = (company: Company): Action[] => [
    {
      label: 'Ver detalles',
      icon: Eye,
      onClick: () => router.push(`/empresas/${company.id}`),
      variant: 'default'
    },
    {
      label: 'Editar',
      icon: Edit2,
      onClick: () => router.push(`/empresas/${company.id}/editar`),
      variant: 'default'
    }
  ];

  return (
    <div className="p-6">
      {companies.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Building2 size={32} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay empresas registradas</h3>
            <p className="text-gray-500 mb-6">Comienza creando tu primera empresa en el sistema</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  RUC
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                  Contacto
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                  Fecha Creación
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Building2 size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">ID: #{company.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-mono text-gray-900">{company.ruc}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {company.phone ? (
                        <>
                          <Phone size={14} className="text-gray-400" />
                          <span>{company.phone}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span>
                        {new Intl.DateTimeFormat('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(company.createdAt))}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RowActions actions={getRowActions(company)} />
                      <DeactivateCompanyDialog id={company.id} name={company.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
