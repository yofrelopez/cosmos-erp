// src/app/(admin)/empresas/page.tsx
import { prisma } from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import AddCompanyModal from '@/components/companies/AddCompanyModal';
import CompanyTable from '@/components/companies/CompanyTable';
import PageHeader from '@/components/common/PageHeader';
import { Building2 } from 'lucide-react';




/**
 * Metadatos para SEO y rutas.
 */
export const metadata: Metadata = {
  title: 'Empresas | ERP V&D Cosmos',
  description: 'Gestión de empresas registradas en el sistema ERP.',
};

/**
 * Página principal del módulo de Empresas.
 * - Es un Server Component; trae los datos directamente desde Prisma.
 * - `noStore()` evita el caché para mostrar la lista siempre actual.
 */
export default async function EmpresasPage() {
  noStore();

  const companies = await prisma.company.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="page-container">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestión de Empresas"
          subtitle="Administra las empresas registradas en el sistema"
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Empresas', href: '/admin/empresas' },
          ]}
        />

        {/* Contenedor principal */}
        <div className="main-card">
          {/* Header con estadísticas mejorado */}
          <div className="card-padding border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 size={26} className="text-white" />
                </div>
                <div>
                  <h2 className="title-section">
                    Empresas Registradas
                  </h2>
                  <p className="subtitle-section">
                    {companies.length} {companies.length === 1 ? 'empresa registrada' : 'empresas registradas'} en el sistema
                  </p>
                </div>
              </div>
              
              <AddCompanyModal />
            </div>
          </div>

          {/* Tabla de empresas */}
          <CompanyTable initialData={companies} />
        </div>
      </div>
    </main>
  );
}
