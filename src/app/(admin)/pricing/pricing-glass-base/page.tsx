// app/(admin)/pricing/pricing-glass-base/page.tsx
import PricingGlassBaseTable from '@/components/pricing/PricingGlassBaseTable'

export const metadata = { title: 'Precios base de vidrio' }

export default function Page() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Precios base de vidrio</h1>
      <PricingGlassBaseTable />
    </div>
  )
}
