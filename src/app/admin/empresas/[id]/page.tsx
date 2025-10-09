// src/app/(admin)/empresas/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PageHeader from '@/components/common/PageHeader';
import CompanyDetailsView from '@/components/companies/CompanyDetailsView';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Genera metadatos dinámicos para la página de detalles de empresa
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id: parseInt(id) },
  });

  if (!company) {
    return {
      title: 'Empresa no encontrada | ERP V&D Cosmos',
    };
  }

  return {
    title: `${company.name} | ERP V&D Cosmos`,
    description: `Detalles de la empresa ${company.name} - RUC: ${company.ruc}`,
  };
}

/**
 * Página de detalles de empresa (solo lectura)
 */
export default async function CompanyDetailsPage({ params }: Props) {
  const { id } = await params;
  const companyId = parseInt(id);

  if (isNaN(companyId)) {
    notFound();
  }

  // Obtener empresa con todas las relaciones
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      bankAccounts: {
        orderBy: { bank: 'asc' },
      },
      wallets: {
        orderBy: { type: 'asc' },
      },
    },
  });

  if (!company) {
    notFound();
  }

  return (
    <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={company.name}
          subtitle="Detalles de la empresa"
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Admin', href: '/' },
            { label: 'Empresas', href: '/empresas' },
            { label: company.name, href: `/admin/empresas/${company.id}` },
          ]}
        />

        <CompanyDetailsView company={company} />
      </div>
    </main>
  );
}