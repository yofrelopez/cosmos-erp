'use client'

import { useState } from 'react'
import Link from 'next/link'
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
      <main className="page-container">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestión de Vidrios"
            subtitle="Gestiona precios y texturas de vidrios"
            showBreadcrumb={true}
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Precios', href: '/admin/precios' },
              { label: 'Vidrios', href: '/admin/precios/vidrios' },
            ]}
          />
          
          <div className="main-card">
            <div className="empty-state-container">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <DollarSign size={28} className="text-orange-600" />
              </div>
              <h3 className="title-secondary mb-3">
                Selecciona una empresa
              </h3>
              <p className="description-empty-state mb-8 max-w-sm mx-auto">
                Para gestionar precios de vidrios necesitas seleccionar una empresa primero.
              </p>
              <div className="space-y-3">
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  <DollarSign size={18} />
                  Ir al Dashboard
                </Link>
                <p className="text-xs text-gray-500">
                  Selecciona una empresa para gestionar precios
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
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
    <main className="page-container">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestión de Vidrios"
          subtitle={tabs.find(tab => tab.id === activeTab)?.description || "Administra precios, colores y texturas de vidrios"}
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Precios', href: '/admin/precios' },
            { label: 'Vidrios', href: '/admin/precios/vidrios' },
          ]}
        />

        {/* Pestañas Modernas */}
        <div className="main-card">
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