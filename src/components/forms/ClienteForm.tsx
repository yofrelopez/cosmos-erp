'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, ClientFormValues } from '@/lib/validators/clienteSchema'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { useClients } from '@/hooks/useClients'

type Props = {
  onSuccess?: (client: ClientFormValues & { id: number }) => void
  initialData?: ClientFormValues & { id: number; createdAt?: Date }
}

export function ClientForm({ onSuccess, initialData }: Props) {

  const { mutate } = useClients({}) // Importar y usar el hook aquí

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  })

  useEffect(() => {
    if (initialData) reset(initialData)
  }, [initialData, reset])

  const onSubmit = async (data: ClientFormValues) => {
    try {
      const res = await fetch(
        initialData ? `/api/clients/${initialData.id}` : '/api/clients',
        {
          method: initialData ? 'PUT' : 'POST',
          body: JSON.stringify(data),
        }
      )
      
      await new Promise((res) => setTimeout(res, 1000))
      mutate() // 🔁 Refrescar lista de clientes

      if (!res.ok) throw new Error('Error al guardar cliente')

      const newClient = await res.json()
      toast.success(initialData ? 'Cliente actualizado con éxito!' : 'Cliente registrado con éxito!')
      reset()

      if (onSuccess) onSuccess(newClient)
    } catch (error) {
      toast.error('No se pudo guardar el cliente')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 bg-white p-6 rounded shadow-md max-w-md mx-auto"
    >
      <div>
        <label className="block font-medium">Tipo de Documento</label>
        <select
          {...register('documentType')}
          className={`w-full border p-2 rounded ${isSubmitting ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          <option value="">Seleccionar...</option>
          <option value="DNI">DNI</option>
          <option value="RUC">RUC</option>
          <option value="CE">CE</option>
        </select>
        {errors.documentType && <p className="text-red-500 text-sm">{errors.documentType.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Número de Documento</label>
        <input
          type="text"
          disabled={isSubmitting}
          {...register('documentNumber')}
          className={`w-full border p-2 rounded ${isSubmitting ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        />
        {errors.documentNumber && <p className="text-red-500 text-sm">{errors.documentNumber.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Nombre Completo</label>
        <input
          type="text"
          disabled={isSubmitting}
          {...register('fullName')}
          className={`w-full border p-2 rounded ${isSubmitting ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        />
        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Correo Electrónico</label>
        <input
          type="email"
          disabled={isSubmitting}
          {...register('email')}
          className={`w-full border p-2 rounded ${isSubmitting ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Teléfono</label>
        <input
          type="text"
          disabled={isSubmitting}
          {...register('phone')}
          className={`w-full border p-2 rounded ${isSubmitting ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        />
      </div>

      <div>
        <label className="block font-medium">Dirección</label>
        <input
          type="text"
          disabled={isSubmitting}
          {...register('address')}
          className={`w-full border p-2 rounded ${isSubmitting ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        />
      </div>

      <div>
        <label className="block font-medium">Observaciones</label>
        <textarea
          disabled={isSubmitting}
          {...register('notes')}
          className={`w-full border p-2 rounded ${isSubmitting ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar'}
      </button>
    </form>
  )
}
