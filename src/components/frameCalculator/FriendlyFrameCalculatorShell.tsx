"use client";

import { useCompanyStore } from "@/lib/store/useCompanyStore";
import FriendlyFrameCalculator from "./FriendlyFrameCalculator";
import PageHeader from "@/components/common/PageHeader";
import { Frame, Building2 } from "lucide-react";

type Props = {
  quoteId?: number;
  companyId?: number;
};

export default function FriendlyFrameCalculatorShell({ quoteId, companyId }: Props) {
  const companyFromStore = useCompanyStore((s: any) => s.company);
  const resolvedCompanyId = companyId ?? companyFromStore?.id ?? 1; // Default to company ID 1 for testing

  console.log('FriendlyFrameCalculatorShell Debug:', {
    companyId,
    companyFromStore: companyFromStore?.id,
    resolvedCompanyId
  });

  if (!resolvedCompanyId) {
    return (
      <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Calculadora de Cuadros"
            subtitle="Calcula precios de cuadros y marcos para cotizaciones"
            showBreadcrumb={true}
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Cotizaciones', href: '/cotizaciones' },
              { label: 'Calculadora Cuadros', href: '/cotizaciones/calculadora-cuadros' },
            ]}
          />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una empresa</h3>
              <p className="text-gray-500">Para usar la calculadora necesitas seleccionar una empresa primero.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div>
      <main className="px-4 sm:px-6 pt-3 pb-1">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Calculadora de Cuadros"
            subtitle="Cotiza marcos y cuadros rápidamente"
            showBreadcrumb={true}
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Cotizaciones', href: '/cotizaciones' },
              { label: 'Calculadora Cuadros', href: '/cotizaciones/calculadora-cuadros' },
            ]}
          />
        </div>
      </main>
      
      <FriendlyFrameCalculator companyId={resolvedCompanyId} />
    </div>
  );
}