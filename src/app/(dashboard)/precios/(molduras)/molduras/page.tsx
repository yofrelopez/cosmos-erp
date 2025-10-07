'use client'

import MoldingsTable from '@/components/pricing/MoldingsTable'
import { useCompanyStore } from '@/lib/store/useCompanyStore'

export default function MoldurasPage() {
  const companyId = useCompanyStore((s) => s.company?.id)

  if (!companyId) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Molduras</h2>
            <p className="text-gray-600 text-sm">Gestiona precios de molduras por metro lineal</p>
          </div>
        </div>
        <div className="text-center py-10">
          <p className="text-gray-500">Selecciona una empresa para continuar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Molduras</h2>
          <p className="text-gray-600 text-sm">Gestiona precios de molduras por metro lineal con relación a espesores</p>
        </div>
      </div>
      
      <MoldingsTable companyId={companyId} />
    </div>
  )
}