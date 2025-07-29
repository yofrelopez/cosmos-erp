import { useCompanyStore } from '@/lib/store/useCompanyStore'
import useSWR from 'swr'


const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useClients({
  search = '',
  page = 1,
  pageSize = 10,
}: {
  search?: string
  page?: number
  pageSize?: number
}) {
  // 1️⃣  Leemos la empresa activa desde Zustand
  const companyId = useCompanyStore((s) => s.company?.id)

  // 2️⃣  Construimos la clave solo si hay companyId
  const key = companyId
    ? `/api/clients?companyId=${companyId}&search=${search}&page=${page}&pageSize=${pageSize}`
    : null          // -> SWR no hace la petición si key === null

  const { data, error, isLoading, mutate, isValidating } = useSWR(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  })

  return {
    clients: data?.clients ?? [],
    total: data?.total ?? 0,
    isLoading,
    isValidating,
    error,
    mutate,          // 3️⃣  exponemos mutate para refrescar desde fuera
  }
}
