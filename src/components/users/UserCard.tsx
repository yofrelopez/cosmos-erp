'use client'

import React, { useState } from 'react'
import { User, UserRole } from '@prisma/client'
import { toast } from 'sonner'

type UserWithDetails = User & {
  company: {
    id: number
    name: string
    ruc: string
    status: string
  } | null
  _count: {
    quotes: number
  }
}

type CompanyOption = {
  id: number
  name: string
  ruc: string
  status: string
}

interface UserCardProps {
  user: UserWithDetails
  companies: CompanyOption[]
  getRoleBadgeColor: (role: UserRole) => string
  roleLabels: Record<UserRole, string>
}

export default function UserCard({ user, companies, getRoleBadgeColor, roleLabels }: UserCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async () => {
    if (user.role === 'SUPER_ADMIN') {
      toast.error('No se puede desactivar un Super Administrador')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/users/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          isActive: !user.isActive,
        }),
      })

      if (response.ok) {
        toast.success(
          user.isActive 
            ? 'Usuario desactivado correctamente' 
            : 'Usuario activado correctamente'
        )
        // Recargar la página para reflejar los cambios
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al cambiar el estado del usuario')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header con avatar y estado */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {user.image ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={user.image}
                  alt={user.name || user.email}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'Sin nombre'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Estado */}
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                user.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {user.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="space-y-3">
          {/* Rol */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Rol:</span>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
              {roleLabels[user.role]}
            </span>
          </div>

          {/* Usuario */}
          {user.username && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Usuario:</span>
              <span className="text-sm font-medium text-gray-900">@{user.username}</span>
            </div>
          )}

          {/* Empresa */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Empresa:</span>
            <span className="text-sm font-medium text-gray-900">
              {user.company ? user.company.name : 'Sin asignar'}
            </span>
          </div>

          {/* Teléfono */}
          {user.phone && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Teléfono:</span>
              <span className="text-sm font-medium text-gray-900">{user.phone}</span>
            </div>
          )}

          {/* Estadísticas */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Cotizaciones:</span>
            <span className="text-sm font-medium text-gray-900">{user._count.quotes}</span>
          </div>

          {/* Último login */}
          {user.lastLogin && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Último acceso:</span>
              <span className="text-sm text-gray-900">
                {formatDate(user.lastLogin)}
              </span>
            </div>
          )}

          {/* Fecha de creación */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Creado:</span>
            <span className="text-sm text-gray-900">
              {formatDate(user.createdAt)}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={handleToggleStatus}
              disabled={isLoading || user.role === 'SUPER_ADMIN'}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                user.isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400'
              } disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : user.isActive ? (
                'Desactivar'
              ) : (
                'Activar'
              )}
            </button>

            <button
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              onClick={() => {
                // TODO: Implementar edición de usuario
                toast.info('Funcionalidad de edición próximamente')
              }}
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}