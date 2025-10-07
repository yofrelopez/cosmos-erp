// app/(dashboard)/precios/layout.tsx
'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const pricingTabs = [
  { href: '/precios/vidrios', label: 'Vidrios' },
  { href: '/precios/molduras', label: 'Molduras' },
]

export default function PricingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Precios</h1>
      </div>
      
      {/* Tabs de navegación */}
      <div className="border-b">
        <nav className="flex space-x-8 overflow-x-auto">
          {pricingTabs.map((tab) => {
            // Para molduras, incluir todas las sub-rutas como activas
            const isActive = tab.href === '/precios/molduras' 
              ? pathname.startsWith('/precios/molduras') || 
                pathname === '/precios/espesores' ||
                pathname === '/precios/fondos' ||
                pathname === '/precios/soportes' ||
                pathname === '/precios/accesorios'
              : pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {children}
      </div>
    </div>
  )
}