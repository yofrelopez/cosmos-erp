'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Users, FileText, UserCheck } from 'lucide-react'
import { useCompanyStore } from '@/lib/store/useCompanyStore'

interface Stats {
  totalCompanies: number
  activeCompanies: number
  totalUsers: number
  activeUsers: number
  totalQuotes: number
  totalClients: number
}

interface Company {
  id: number
  name: string
  ruc: string
  logoUrl: string | null
  status: string
  _count: {
    users: number
    quotes: number
    clients: number
  }
}

interface SuperAdminDashboardProps {
  stats: Stats
  companies: Company[]
}

export default function SuperAdminDashboard({ stats, companies }: SuperAdminDashboardProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const router = useRouter()
  const setCompany = useCompanyStore((s) => s.setCompany)

  const handleSelectCompany = (company: Company) => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">
          Dashboard Super Administrador
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Vista general del sistema y gestión de empresas
        </p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Empresas Activas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.activeCompanies} / {stats.totalCompanies}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuarios Activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.activeUsers} / {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cotizaciones Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalQuotes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Clientes Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalClients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Empresas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Empresas del Sistema
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Haz clic en una empresa para trabajar con sus datos
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {companies.map((company) => (
            <li key={company.id}>
              <button
                onClick={() => handleSelectCompany(company)}
                className="w-full block hover:bg-gray-50 px-4 py-4 sm:px-6 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {company.logoUrl ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={company.logoUrl} 
                          alt={company.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {company.name}
                        </p>
                        <span
                          className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            company.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {company.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">RUC: {company.ruc}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{company._count.users}</p>
                      <p className="text-xs">Usuarios</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{company._count.quotes}</p>
                      <p className="text-xs">Cotizaciones</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{company._count.clients}</p>
                      <p className="text-xs">Clientes</p>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}