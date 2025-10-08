'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/BaseModal';
import CompanyForm from './CompanyForm';
import { Building2, Plus } from 'lucide-react';

export default function AddCompanyModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Nueva Empresa</span>
        <span className="sm:hidden">Nueva</span>
      </button>

      <BaseModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Registrar Nueva Empresa"
        description="Agrega una nueva empresa al sistema"
        icon={<Building2 size={20} className="text-blue-600" />}
        size="lg"
        showCloseButton
      >
        <CompanyForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </BaseModal>
    </>
  );
}

