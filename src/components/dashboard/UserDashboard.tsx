'use client'

import { useRouter } from 'next/navigation'
import { Building2, FileText, Users } from 'lucide-react'
import { useCompanyStore } from '@/lib/store/useCompanyStore'

interface UserDashboardProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    role?: string
  }
  companies: Array<{
    id: number
    name: string
    ruc: string
    logoUrl: string | null
    status: string
    _count: {
      quotes: number
      clients: number
    }
  }>
}

export default function UserDashboard({ user, companies }: UserDashboardProps) {
  const router = useRouter()
  const setCompany = useCompanyStore((s) => s.setCompany)

  const handleSelectCompany = (company: any) => {
    // Convertir a formato completo que espera el store
    const fullCompany = {
      ...company,
      status: company.status as any,
      address: null,
      phone: null,
      whatsapp: null,
      facebookUrl: null,
      instagramUrl: null,
      tiktokUrl: null,
      email: null,
      website: null,
      slogan: null,
      description: null,
      notes: null,
      legalRepresentative: null,
      administrator: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setCompany(fullCompany)
    router.push('/admin')
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrador'
      case 'ADMIN': return 'Administrador'
      case 'OPERATOR': return 'Operador'
      default: return 'Usuario'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header de Bienvenida */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {user.name || 'Usuario'}!
        </h1>
        <p className="text-gray-600">
          {getRoleLabel(user.role)} • {user.email}
        </p>
      </div>

      {/* Estadísticas del Usuario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">{companies.length}</h3>
          <p className="text-sm text-gray-600">
            {companies.length === 1 ? 'Empresa' : 'Empresas'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            {companies.reduce((total, company) => total + company._count.quotes, 0)}
          </h3>
          <p className="text-sm text-gray-600">Cotizaciones Total</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            {companies.reduce((total, company) => total + company._count.clients, 0)}
          </h3>
          <p className="text-sm text-gray-600">Clientes Total</p>
        </div>
      </div>

      {/* Selección de Empresa */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Selecciona tu Empresa
          </h2>
          <p className="text-gray-600">
            Elige la empresa con la que deseas trabajar hoy
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sin empresas asignadas
            </h3>
            <p className="text-gray-600">
              Contacta al administrador para que te asigne a una empresa
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => handleSelectCompany(company)}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        RUC: {company.ruc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{company._count.quotes}</span>
                        <span className="ml-1">Cotizaciones</span>
                      </div>
                      <div>
                        <span className="font-medium">{company._count.clients}</span>
                        <span className="ml-1">Clientes</span>
                      </div>
                    </div>
                    
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}