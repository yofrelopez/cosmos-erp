"use client";

import { useCompanyStore } from "@/lib/store/useCompanyStore";
import FriendlyFrameCalculator from "./FriendlyFrameCalculator";

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-md">
          <div className="text-6xl mb-6">🏢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Selecciona una empresa
          </h2>
          <p className="text-gray-600 text-lg">
            Para usar la calculadora necesitas seleccionar una empresa primero
          </p>
        </div>
      </div>
    );
  }

  return (
    <FriendlyFrameCalculator 
      companyId={resolvedCompanyId}
    />
  );
}