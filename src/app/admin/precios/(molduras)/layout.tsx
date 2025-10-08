'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const moldurasSubTabs = [
  { href: '/precios/molduras', label: 'Molduras' },
  { href: '/precios/espesores', label: 'Espesores' },
  { href: '/precios/texturas', label: 'Texturas' },
  { href: '/precios/colores', label: 'Colores' },
  { href: '/precios/fondos', label: 'Fondos' },
  { href: '/precios/soportes', label: 'Soportes' },
  { href: '/precios/accesorios', label: 'Accesorios' },
]

export default function MoldurasLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sub-navegación moderna */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto py-4">
            {moldurasSubTabs.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`whitespace-nowrap px-4 py-2 mx-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-gray-50 min-h-screen">
        {children}
      </div>
    </div>
  )
}