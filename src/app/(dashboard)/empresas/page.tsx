// src/app/(dashboard)/empresas/page.tsx
import { prisma } from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import AddCompanyModal from '@/components/companies/AddCompanyModal';
import CompanyTable from '@/components/companies/CompanyTable';




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
    orderBy: { createdAt: 'desc' },
  });

  return (
    <section className="flex flex-col gap-6">
      {/* Encabezado con botón para crear */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
        <AddCompanyModal /> {/* Botón/Modal de nueva empresa */}
      </header>

      {/* Tabla de empresas (Client Component) */}
      <CompanyTable initialData={companies} />
    </section>
  );
}
