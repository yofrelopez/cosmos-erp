// app/(dashboard)/cotizaciones/calculadora-vidrios/page.tsx

import FriendlyGlassCalculatorShell from "@/components/glassCalculator/FriendlyGlassCalculatorShell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Calculadora de Vidrios | ERP V&D Cosmos',
  description: 'Calcula precios de vidrios y genera cotizaciones automáticamente',
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

    return <FriendlyGlassCalculatorShell quoteId={quoteId} />;
  } catch (error) {
    console.error('Error in calculadora-vidrios page:', error);
    return <FriendlyGlassCalculatorShell />;
  }
}
