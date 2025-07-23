import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())


export function useClients({ search = '', page = 1, pageSize = 10 }) {
  const { data, error, isLoading, mutate, isValidating } = useSWR(
    `/api/clients?search=${search}&page=${page}&pageSize=${pageSize}`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,     // ⛔️ No revalides al volver a la pestaña
      revalidateOnReconnect: false, // ⛔️ Ni al reconectarte
      refreshInterval: 0,           // ⛔️ No refresques periódicamente
    }
  )

  return {
    clients: data?.clients || [],
    total: data?.total || 0,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}
