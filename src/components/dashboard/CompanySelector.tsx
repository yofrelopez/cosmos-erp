'use client'

import { useState, useRef, useEffect } from 'react'
import { Building2, ChevronDown, Check } from 'lucide-react'
import { useCompanyStore } from '@/lib/store/useCompanyStore'

interface Company {
  id: number
  name: string
  ruc: string
  logoUrl: string | null
  status: string
  _count: {
    users?: number
    quotes: number
    clients: number
  }
}

interface CompanySelectorProps {
  companies: Company[]
  onSelectCompany: (company: Company) => void
}

export default function CompanySelector({ companies, onSelectCompany }: CompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedCompany = useCompanyStore((s) => s.company)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCompanySelect = (company: Company) => {
    onSelectCompany(company)
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      {/* Indicador de empresa actual */}
      {selectedCompany && (
        <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border border-orange-200 order-2 sm:order-1">
          <Building2 size={16} className="mr-2 text-orange-600" />
          <span className="truncate max-w-[200px]">
            {selectedCompany.name}
          </span>
        </div>
      )}

      {/* Selector dropdown */}
      <div className="relative order-1 sm:order-2" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        >
          <Building2 size={16} className="mr-2 text-gray-500" />
          {selectedCompany ? 'Cambiar empresa' : 'Seleccionar empresa'}
          <ChevronDown 
            size={16} 
            className={`ml-2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-64 overflow-y-auto">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              Empresas disponibles
            </div>
            
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleCompanySelect(company)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between group ${
                  selectedCompany?.id === company.id ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedCompany?.id === company.id 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    <Building2 size={20} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-medium ${
                      selectedCompany?.id === company.id ? 'text-orange-900' : 'text-gray-900'
                    }`}>
                      {company.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      RUC: {company.ruc}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {company._count.users !== undefined && (
                        <span>{company._count.users} usuarios</span>
                      )}
                      <span>{company._count.quotes} cotizaciones</span>
                      <span>{company._count.clients} clientes</span>
                    </div>
                  </div>
                </div>
                
                {selectedCompany?.id === company.id && (
                  <Check size={16} className="text-orange-600 flex-shrink-0" />
                )}
              </button>
            ))}
            
            {companies.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No hay empresas disponibles
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}