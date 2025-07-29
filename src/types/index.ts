

export type ViewQuote = Quote & {
  client: Client
  items: QuoteItem[]
}



export type QuoteItemForm = {
  id?: number; // en modo creación puede no tener id aún
  quoteId?: number; // opcional también si es antes de guardar
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
};


export interface Client {
  id: number;
  documentType: string;
  documentNumber: string;
  fullName: string;
  businessName: string | null; // antes era `string | undefined`
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string | Date;
}


// src/types/index.ts
export interface ClientLite {
  id: number;
  documentType: string;
  documentNumber: string;
  fullName: string;
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string; // ya como string para evitar problemas de serialización
}

// types/quote.ts
export interface Quote {
  id: number
  code: string         // nuevo campo
  clientId: number
  createdAt: string // puede ser Date si lo transformas
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  notes?: string | null
  total: number
  createdById?: number | null
  client: {
    id: number
    fullName: string
  }
}


export interface QuoteItem {
  id: number
  quoteId: number
  description: string
  unit: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type QuoteItemInput = {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type QuoteFormValues = {
  clientId: number;
  items: QuoteItemInput[];
};
