'use client'

import { useState } from 'react'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import GlassesTable from '@/components/pricing/GlassesTable'
import SimpleTexturesTable from '@/components/pricing/SimpleTexturesTable'
import SimpleColorsTable from '@/components/pricing/SimpleColorsTable'
import PageHeader from '@/components/common/PageHeader'
import { Palette, Waves, DollarSign } from 'lucide-react'

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
      name: 'Precios',
      icon: DollarSign,
      description: 'Gestiona precios por nombre comercial, familia, espesor y color',
      count: 'Productos'
    },
    {
      id: 'colores' as TabType,
      name: 'Colores',
      icon: Palette,
      description: 'Gestiona nombres de colores disponibles para vidrios de tipo COLOR',
      count: 'Colores'
    },
    {
      id: 'texturas' as TabType,
      name: 'Texturas',
      icon: Waves,
      description: 'Gestiona tipos de texturas disponibles para cada familia',
      count: 'Texturas'
    }
  ]

  return (
    <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestión de Vidrios"
          subtitle={tabs.find(tab => tab.id === activeTab)?.description || "Administra precios, colores y texturas de vidrios"}
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Admin', href: '/' },
            { label: 'Precios', href: '/precios' },
            { label: 'Vidrios', href: '/precios/vidrios' },
          ]}
        />

        {/* Pestañas Modernas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-0" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          <div className="bg-white">
            {activeTab === 'precios' && <GlassesTable companyId={companyId} />}
            {activeTab === 'colores' && <SimpleColorsTable companyId={companyId} />}
            {activeTab === 'texturas' && <SimpleTexturesTable companyId={companyId} />}
          </div>
        </div>
      </div>
    </main>
  )
}