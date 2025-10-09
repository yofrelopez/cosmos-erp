import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import EditQuoteForm from '@/components/quotes/EditQuoteForm';
import PageHeader from '@/components/common/PageHeader';

export const metadata: Metadata = {
  title: 'Editar Cotización',
};

interface EditQuotePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  
  const id = Number((await params).id); // espera primero, luego lee .id

  if (isNaN(id)) return notFound();

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      items: true,
    },
  });

  if (!quote) return notFound();

  const clientName = quote.client?.fullName || quote.client?.businessName || 'Cliente sin nombre';

  return (
    <main className="px-4 sm:px-6 pt-3 pb-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title={`Editar Cotización #${quote.id}`}
          subtitle={`Cliente: ${clientName}`}
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Cotizaciones', href: '/cotizaciones' },
            { label: `Cotización #${quote.id}`, href: `/admin/cotizaciones/${quote.id}` },
            { label: 'Editar', href: `/admin/cotizaciones/${quote.id}/editar` },
          ]}
        />

        {/* Contenedor principal con diseño moderno */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Información de la Cotización</h2>
                <p className="text-sm text-gray-600 mt-1">Modifica el estado y las notas de la cotización</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Fecha de creación</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(quote.createdAt).toLocaleDateString('es-PE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <EditQuoteForm
              quoteId={quote.id}
              clientId={quote.clientId}
              status={quote.status}
              notes={quote.notes ?? ''}
              items={quote.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
              }))}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
