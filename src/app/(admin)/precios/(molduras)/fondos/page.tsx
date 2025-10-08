'use client'

import { useCompanyStore } from '@/lib/store/useCompanyStore'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import MatboardsTable from '@/components/pricing/MatboardsTable'

export default function FondosPage() {
  const companyId = useCompanyStore((s) => s.company?.id)

  if (!companyId) {
    return (
      <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestión de Precios - Fondos"
            subtitle="Gestiona precios de fondos para marcos y cuadros"
            breadcrumbs={[
              { label: 'Admin', href: '/' },
              { label: 'Precios', href: '/precios' },
              { label: 'Fondos', href: '/precios/fondos' }
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
          title="Gestión de Precios - Fondos"
          subtitle="Gestiona precios de fondos para marcos y cuadros"
          breadcrumbs={[
            { label: 'Admin', href: '/' },
            { label: 'Precios', href: '/precios' },
            { label: 'Fondos', href: '/precios/fondos' }
          ]}
        />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-0">
            <MatboardsTable companyId={companyId} />
          </div>
        </div>
      </div>
    </main>
  )
}