import { Quote, Client } from '@prisma/client';
import { usePaginatedList } from './usePaginatedList';

export type QuoteWithClient = Quote & {
  client: Pick<
    Client,
    'id' | 'fullName' | 'businessName' | 'documentType' | 'documentNumber' | 'phone' | 'address' | 'email'
  >;
};


export function useQuotes() {
  return usePaginatedList<QuoteWithClient>({
    endpoint: '/api/quotes',
    pageSize: 10,
  });
}
