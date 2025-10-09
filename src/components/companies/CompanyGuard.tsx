'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCompanyStore } from '@/lib/store/useCompanyStore'
import { useHydratedStore } from '@/hooks/useHydratedStore'


export default function CompanyGuard({ children }: { children: ReactNode }) {
  const hydrated = useHydratedStore()                 // ✅
  const company  = useCompanyStore((s) => s.company)
  const pathname = usePathname()
  const router   = useRouter()

  // Mientras no hidrata, no mostramos nada
  if (!hydrated) return null

  // Para el dashboard, no necesitamos empresa seleccionada (se selecciona allí)
  // Para otras rutas, podrías agregar lógica específica si es necesario

  return <>{children}</>
}
