'use client'

import Link from 'next/link'
import MoldingsTable from '@/components/pricing/MoldingsTable'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import PageHeader from '@/components/common/PageHeader'
import { Frame } from 'lucide-react'

export default function MoldurasPage() {
  const companyId = useCompanyStore((s) => s.company?.id)

  if (!companyId) {
    return (
      <main className="page-container">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestión de Precios - Molduras"
            subtitle="Gestiona precios de molduras y marcos"
            showBreadcrumb={true}
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Precios', href: '/admin/precios' },
              { label: 'Molduras', href: '/admin/precios/molduras' }
            ]}
          />
          
          <div className="main-card">
            <div className="empty-state-container">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Frame size={28} className="text-orange-600" />
              </div>
              <h3 className="title-secondary mb-3">
                Selecciona una empresa
              </h3>
              <p className="description-empty-state mb-8 max-w-sm mx-auto">
                Para gestionar precios de molduras necesitas seleccionar una empresa primero.
              </p>
              <div className="space-y-3">
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  <Frame size={18} />
                  Ir al Dashboard
                </Link>
                <p className="text-xs text-gray-500">
                  Selecciona una empresa para gestionar molduras
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page-container">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestión de Precios - Molduras"
          subtitle="Gestiona precios de molduras y marcos"
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Precios', href: '/admin/precios' },
            { label: 'Molduras', href: '/admin/precios/molduras' }
          ]}
        />
        
        <div className="main-card">
          <div className="p-0">
            <MoldingsTable companyId={companyId} />
          </div>
        </div>
      </div>
    </main>
  )
}