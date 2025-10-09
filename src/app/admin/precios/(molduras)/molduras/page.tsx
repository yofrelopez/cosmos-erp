'use client'

import MoldingsTable from '@/components/pricing/MoldingsTable'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import PageHeader from '@/components/common/PageHeader'

export default function MoldurasPage() {
  const companyId = useCompanyStore((s) => s.company?.id)

  if (!companyId) {
    return (
      <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestión de Precios - Molduras"
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Precios', href: '/admin/precios' },
              { label: 'Molduras', href: '/admin/precios/molduras' }
            ]}
          />
          <div className="text-center py-10">
            <p className="text-gray-500">Selecciona una empresa para continuar</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestión de Precios - Molduras"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Precios', href: '/admin/precios' },
            { label: 'Molduras', href: '/admin/precios/molduras' }
          ]}
        />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-0">
            <MoldingsTable companyId={companyId} />
          </div>
        </div>
      </div>
    </main>
  )
}