// src/app/(dashboard)/empresas/[id]/editar/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TabsWrapper from '@/components/companies/TabsWrapper';
import PageHeader from '@/components/common/PageHeader';
import { Metadata } from 'next';
import { Building2 } from "lucide-react";

interface Props { params: Promise<{ id: string }> }

/**
 * Metadatos para SEO y rutas.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const companyId = Number((await params).id);
  
  if (isNaN(companyId)) {
    return { title: 'Empresa no encontrada | ERP V&D Cosmos' };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true }
  });

  return {
    title: `Editar ${company?.name || 'Empresa'} | ERP V&D Cosmos`,
    description: `Edita la información de ${company?.name || 'la empresa'}`,
  };
}

export default async function EditCompanyPage({ params }: Props) {
  const companyId = Number((await params).id);

  if (isNaN(companyId)) notFound();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) notFound();

  return (
    <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={`Editar ${company.name}`}
          subtitle="Actualiza la información de la empresa"
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Empresas', href: '/empresas' },
            { label: company.name, href: `/empresas/${company.id}` },
            { label: 'Editar', href: `/empresas/${company.id}/editar` },
          ]}
        />

        {/* Contenedor principal modernizado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <TabsWrapper company={company} />
        </div>
      </div>
    </main>
  );
}
