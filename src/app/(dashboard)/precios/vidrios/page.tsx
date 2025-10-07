'use client'

import { useState } from 'react'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import GlassesTable from '@/components/pricing/GlassesTable'
import SimpleTexturesTable from '@/components/pricing/SimpleTexturesTable'
import SimpleColorsTable from '@/components/pricing/SimpleColorsTable'

type TabType = 'precios' | 'texturas' | 'colores'

export default function VidriosPage() {
  const companyId = useCompanyStore((s) => s.company?.id)
  const [activeTab, setActiveTab] = useState<TabType>('precios')

  if (!companyId) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Vidrios</h2>
            <p className="text-gray-600 text-sm">Gestiona precios y texturas de vidrios</p>
          </div>
        </div>
        <div className="text-center py-10">
          <p className="text-gray-500">Selecciona una empresa para continuar</p>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'precios' as TabType,
      name: 'Precios de Vidrios',
      description: 'Gestiona precios por nombre comercial, familia, espesor y color'
    },
    {
      id: 'colores' as TabType,
      name: 'Colores',
      description: 'Gestiona nombres de colores disponibles para vidrios de tipo COLOR'
    },
    {
      id: 'texturas' as TabType,
      name: 'Texturas',
      description: 'Gestiona tipos de texturas disponibles para cada familia'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestión de Vidrios</h2>
          <p className="text-gray-600 text-sm">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === 'precios' && <GlassesTable companyId={companyId} />}
        {activeTab === 'colores' && <SimpleColorsTable companyId={companyId} />}
        {activeTab === 'texturas' && <SimpleTexturesTable companyId={companyId} />}
      </div>
    </div>
  )
}