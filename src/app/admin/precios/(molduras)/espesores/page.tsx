'use client'

import ThicknessesTable from '@/components/pricing/ThicknessesTable'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import AddThicknessModal from '@/components/pricing/AddThicknessModal'
import PageHeader from '@/components/common/PageHeader'

export default function EspesoresPage() {
  const companyId = useCompanyStore((s: any) => s.company?.id)
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  if (!companyId) {
    return (
      <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestión de Precios - Espesores"
            breadcrumbs={[
              { label: 'Admin', href: '/' },
              { label: 'Precios', href: '/precios' },
              { label: 'Espesores', href: '/precios/espesores' }
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
          title="Gestión de Precios - Espesores"
          subtitle="Gestiona precios de espesores por metro lineal para molduras y bastidores"
          breadcrumbs={[
            { label: 'Admin', href: '/' },
            { label: 'Precios', href: '/precios' },
            { label: 'Espesores', href: '/precios/espesores' }
          ]}
          action={
            <Button 
              onClick={() => setShowAddModal(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nuevo Espesor</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          }
        />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-0">
            <ThicknessesTable companyId={companyId} key={refreshKey} />
          </div>
        </div>

        {companyId && (
          <AddThicknessModal
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              setRefreshKey(prev => prev + 1)
            }}
            companyId={companyId}
          />
        )}
      </div>
    </main>
  )
}