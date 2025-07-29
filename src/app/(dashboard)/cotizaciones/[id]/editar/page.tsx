import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import EditQuoteForm from '@/components/quotes/EditQuoteForm';

export const metadata: Metadata = {
  title: 'Editar Cotización',
};

interface EditQuotePageProps {
  params: { id: string } | Promise<{ id: string }>;
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Editar Cotización</h1>
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
  );
}
