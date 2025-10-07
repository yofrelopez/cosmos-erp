import SelectCompanyView from "@/components/companies/SelectCompanyView";


export default function SelectCompanyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecciona tu Empresa
          </h1>
          <p className="text-gray-600">
            Elige la empresa con la que deseas trabajar
          </p>
        </div>
        
        <SelectCompanyView />
      </div>
    </div>
  )
}
