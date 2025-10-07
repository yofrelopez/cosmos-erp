'use client'

import React, { useState } from 'react'
import { UserRole } from '@prisma/client'
import { toast } from 'sonner'

type CompanyOption = {
  id: number
  name: string
  ruc: string
  status: string
}

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  companies: CompanyOption[]
}

interface FormData {
  email: string
  name: string
  username: string
  password: string
  confirmPassword: string
  phone: string
  role: UserRole
  companyId: string
}

export default function CreateUserModal({ isOpen, onClose, companies }: CreateUserModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'OPERATOR',
    companyId: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const roleLabels: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrador',
    ADMIN: 'Administrador',
    OPERATOR: 'Operador'
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido'
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (formData.role !== 'SUPER_ADMIN' && !formData.companyId) {
      newErrors.companyId = 'Debe seleccionar una empresa'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          username: formData.username,
          password: formData.password,
          phone: formData.phone || null,
          role: formData.role,
          companyId: formData.role === 'SUPER_ADMIN' ? null : parseInt(formData.companyId),
        }),
      })

      if (response.ok) {
        toast.success('Usuario creado correctamente')
        handleClose()
        // Recargar la página para mostrar el nuevo usuario
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear el usuario')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      email: '',
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'OPERATOR',
      companyId: '',
    })
    setErrors({})
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
                    Crear Nuevo Usuario
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                        placeholder="usuario@empresa.com"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    {/* Nombre */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                          errors.name ? 'border-red-500' : ''
                        }`}
                        placeholder="Juan Pérez"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Username */}
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Nombre de usuario *
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                          errors.username ? 'border-red-500' : ''
                        }`}
                        placeholder="juan.perez"
                      />
                      {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                    </div>

                    {/* Contraseña */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                        placeholder="Mínimo 6 caracteres"
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>

                    {/* Confirmar contraseña */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirmar contraseña *
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                          errors.confirmPassword ? 'border-red-500' : ''
                        }`}
                        placeholder="Confirma tu contraseña"
                      />
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="+51 999 999 999"
                      />
                    </div>

                    {/* Rol */}
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Rol *
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="OPERATOR">{roleLabels.OPERATOR}</option>
                        <option value="ADMIN">{roleLabels.ADMIN}</option>
                        <option value="SUPER_ADMIN">{roleLabels.SUPER_ADMIN}</option>
                      </select>
                    </div>

                    {/* Empresa (solo si no es Super Admin) */}
                    {formData.role !== 'SUPER_ADMIN' && (
                      <div>
                        <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
                          Empresa *
                        </label>
                        <select
                          id="companyId"
                          name="companyId"
                          value={formData.companyId}
                          onChange={handleChange}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            errors.companyId ? 'border-red-500' : ''
                          }`}
                        >
                          <option value="">Selecciona una empresa</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name} - {company.ruc}
                            </option>
                          ))}
                        </select>
                        {errors.companyId && <p className="mt-1 text-sm text-red-600">{errors.companyId}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </span>
                ) : (
                  'Crear Usuario'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}