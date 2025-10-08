'use client'

import { useCompanyStore } from '@/lib/store/useCompanyStore'
import PageHeader from '@/components/common/PageHeader'
import BackingsTable from '@/components/pricing/BackingsTable'

export default function SoportesPage() {
  const companyId = useCompanyStore((s) => s.company?.id)

  if (!companyId) {
    return (
      <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestión de Precios - Soportes"
            subtitle="Gestiona precios de soportes y sistemas de montaje"
            breadcrumbs={[
              { label: 'Admin', href: '/' },
              { label: 'Precios', href: '/precios' },
              { label: 'Soportes', href: '/precios/soportes' }
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
          title="Gestión de Precios - Soportes"
          subtitle="Gestiona precios de soportes y sistemas de montaje"
          breadcrumbs={[
            { label: 'Admin', href: '/' },
            { label: 'Precios', href: '/precios' },
            { label: 'Soportes', href: '/precios/soportes' }
          ]}
        />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-0">
            <BackingsTable companyId={companyId} />
          </div>
        </div>
      </div>
    </main>
  )
}