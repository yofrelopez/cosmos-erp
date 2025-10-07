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
    <div className="space-y-4">
      {/* Sub-tabs de navegación para molduras */}
      <div className="border-b border-gray-200 -mx-6 -mt-6 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 pt-4">
          <nav className="flex space-x-1 overflow-x-auto pb-2">
            {moldurasSubTabs.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`whitespace-nowrap py-2 px-4 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-white text-blue-600 shadow-sm border-t-2 border-blue-600 -mb-px' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {children}
    </div>
  )
}