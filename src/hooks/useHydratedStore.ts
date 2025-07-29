// src/lib/hooks/useHydratedStore.ts
import { useEffect, useState } from 'react'

export function useHydratedStore() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)           // solo después del primer render en el cliente
  }, [])
  return hydrated
}
