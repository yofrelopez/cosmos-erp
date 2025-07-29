'use client'
import { Company } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useCompanyStore } from '@/lib/store/useCompanyStore'

export default function CompanyCard(props: Company) {
  const router = useRouter()
  const setCompany = useCompanyStore((s) => s.setCompany)

  const handleSelect = () => {
    setCompany(props)          // guarda objeto completo
    router.push('/clientes')           // redirige
  }

  return (
    <div onClick={handleSelect} className="cursor-pointer p-4 border rounded">
      <h2 className="font-semibold">{props.name}</h2>
      <p className="text-xs text-gray-500">RUC: {props.ruc}</p>
    </div>
  )
}
