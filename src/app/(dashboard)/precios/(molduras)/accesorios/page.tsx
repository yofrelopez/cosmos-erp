'use client'

import { useCompanyStore } from '@/lib/store/useCompanyStore'
import PageHeader from '@/components/common/PageHeader'
import AccessoriesTable from '@/components/pricing/AccessoriesTable'

export default function AccesoriosPage() {
  const companyId = useCompanyStore((s) => s.company?.id)

  if (!companyId) {
    return (
      <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestión de Precios - Accesorios"
            subtitle="Gestiona precios de accesorios y complementos"
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Precios', href: '/precios' },
              { label: 'Accesorios', href: '/precios/accesorios' }
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
          title="Gestión de Precios - Accesorios"
          subtitle="Gestiona precios de accesorios y complementos"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Precios', href: '/precios' },
            { label: 'Accesorios', href: '/precios/accesorios' }
          ]}
        />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-0">
            <AccessoriesTable companyId={companyId} />
          </div>
        </div>
      </div>
    </main>
  )
}