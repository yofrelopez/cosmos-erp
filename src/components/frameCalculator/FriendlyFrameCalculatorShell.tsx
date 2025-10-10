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
      <main className="page-container">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Calculadora de Cuadros"
            subtitle="Calcula precios de cuadros y marcos para cotizaciones"
            showBreadcrumb={true}
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Cotizaciones', href: '/admin/cotizaciones' },
              { label: 'Calculadora Cuadros', href: '/admin/cotizaciones/calculadora-cuadros' },
            ]}
          />
          
          <div className="main-card">
            <div className="empty-state-container">
              <div className="empty-state-content">
                <div className="empty-state-icon">
                  <Building2 size={32} className="text-orange-500" />
                </div>
                <h3 className="empty-state-title">Selecciona una empresa</h3>
                <p className="empty-state-description">
                  Para usar la calculadora de cuadros necesitas seleccionar una empresa primero desde el dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div>
      <main className="page-container">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Calculadora de Cuadros"
            subtitle="Cotiza marcos y cuadros rápidamente"
            showBreadcrumb={true}
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Cotizaciones', href: '/admin/cotizaciones' },
              { label: 'Calculadora Cuadros', href: '/admin/cotizaciones/calculadora-cuadros' },
            ]}
          />
        </div>
      </main>
      
      <FriendlyFrameCalculator companyId={resolvedCompanyId} />
    </div>
  );
}