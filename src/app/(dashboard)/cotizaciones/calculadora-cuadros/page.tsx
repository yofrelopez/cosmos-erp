// app/(dashboard)/cotizaciones/calculadora-cuadros/page.tsx

import FriendlyFrameCalculatorShell from "@/components/frameCalculator/FriendlyFrameCalculatorShell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Calculadora de Cuadros | ERP V&D Cosmos',
  description: 'Calcula precios de cuadros y marcos, genera cotizaciones automáticamente',
};

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ quoteId?: string }>;
}) {
  try {
    const params = searchParams ? await searchParams : undefined;
    const quoteId = params?.quoteId && !isNaN(Number(params.quoteId)) 
      ? Number(params.quoteId) 
      : undefined;

    return <FriendlyFrameCalculatorShell quoteId={quoteId} />;
  } catch (error) {
    console.error('Error in calculadora-cuadros page:', error);
    return <FriendlyFrameCalculatorShell />;
  }
}