'use client'

import { useCompanyStore } from '@/lib/store/useCompanyStore'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export default function SoportesPage() {
  const companyId = useCompanyStore((s) => s.company?.id)

  if (!companyId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Soportes</h2>
            <p className="mt-1 text-sm text-gray-600">
              Gestiona precios de soportes y sistemas de montaje
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
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Soportes</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona precios de soportes y sistemas de montaje
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            className="gap-2 w-full sm:w-auto"
            disabled
          >
            <Plus size={16} />
            Nuevo Soporte
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-8 text-center">
        <div className="max-w-sm mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Próximamente</h3>
          <p className="text-gray-500">
            La gestión de precios de soportes estará disponible próximamente.
          </p>
        </div>
      </div>
    </div>
  )
}