import { useEffect, useState } from 'react';

interface UsePaginatedListOptions {
  endpoint: string;
  pageSize?: number;
  query?: string;
}

export function usePaginatedList<T>({
  endpoint,
  pageSize = 10,
  query = '',
}: UsePaginatedListOptions) {
  const [data, setData] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set('page', page.toString());
        url.searchParams.set('pageSize', pageSize.toString());
        if (query) url.searchParams.set('search', query);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Error al obtener los datos');

        const json = await res.json();
        setData(json.data || []);
        setTotalItems(json.total || 0);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [endpoint, page, pageSize, query]);

  return {
    data,
    totalItems,
    isLoading,
    error,
    currentPage: page,
    setPage,
    mutate: () => {
      // Forzar refetch
      setPage((prev) => prev); 
    },
  };
}
