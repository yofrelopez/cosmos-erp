// src/app/(dashboard)/empresas/[id]/editar/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TabsWrapper from '@/components/companies/TabsWrapper';
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

interface Props { params: Promise<{ id: string }> }

export default async function EditCompanyPage({ params }: Props) {
  const companyId = Number((await params).id);

  if (isNaN(companyId)) notFound();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) notFound();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar empresa</h1>
        <Link href="/empresas">
        <Button variant="outline" size="md" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Button>
      </Link>
      </div>
       <TabsWrapper company={company} />
     </div>
  );
}
