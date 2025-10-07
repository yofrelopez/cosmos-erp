'use client'

import ThicknessesTable from '@/components/pricing/ThicknessesTable'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import AddThicknessModal from '@/components/pricing/AddThicknessModal'

export default function EspesoresPage() {
  const companyId = useCompanyStore((s: any) => s.company?.id)
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  if (!companyId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Espesores</h2>
            <p className="mt-1 text-sm text-gray-600">
              Gestiona precios de espesores por metro lineal para molduras y bastidores
            </p>
          </div>
        </div>
        <div className="text-center py-10">
          <p className="text-gray-500">Selecciona una empresa para continuar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Espesores</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona precios de espesores por metro lineal para molduras y bastidores
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={() => setShowAddModal(true)} 
            className="gap-2 w-full sm:w-auto"
          >
            <Plus size={16} />
            Nuevo Espesor
          </Button>
        </div>
      </div>
      
      <ThicknessesTable companyId={companyId} key={refreshKey} />

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
  )
}