// app/(dashboard)/cotizaciones/calculadora-cuadros/page.tsx

import FriendlyFrameCalculatorShell from "@/components/frameCalculator/FriendlyFrameCalculatorShell";

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