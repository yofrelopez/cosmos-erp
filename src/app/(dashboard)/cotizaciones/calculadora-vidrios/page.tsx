// app/(dashboard)/cotizaciones/calculadora-vidrios/page.tsx

import FriendlyGlassCalculatorShell from "@/components/glassCalculator/FriendlyGlassCalculatorShell";

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
