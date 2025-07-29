'use client'

import { useEffect, useState } from 'react'
import { Company } from '@prisma/client'
import CompanyCard from './CompanyCard'

export default function SelectCompanyView() {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    fetch('/api/companies')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <CompanyCard key={company.id} {...company} />
      ))}
    </div>
  )
}
