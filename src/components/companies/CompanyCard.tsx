'use client'
import { Company } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useCompanyStore } from '@/lib/store/useCompanyStore'

export default function CompanyCard(props: Company) {
  const router = useRouter()
  const setCompany = useCompanyStore((s) => s.setCompany)

  const handleSelect = () => {
    setCompany(props)
    router.push('/cotizaciones')
  }

  return (
    <div 
      onClick={handleSelect} 
      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {props.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {props.name}
            </h3>
            <p className="text-sm text-gray-500">
              RUC: {props.ruc}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            props.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {props.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
          </span>
          
          <div className="text-right">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
