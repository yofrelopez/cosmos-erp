'use client'

import { ReactNode } from 'react'
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

  // Si no hay empresa y NO estamos en /select-company → redirigir
  if (!company && pathname !== '/select-company') {
    router.replace('/select-company')
    return null
  }

  return <>{children}</>
}
