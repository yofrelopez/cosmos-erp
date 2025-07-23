export type QuoteItemForm = {
  id: number;
  quoteId: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
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


export interface QuoteItem {
  id: number
  quoteId: number
  description: string
  unit: string
  quantity: number
  unitPrice: number
  subtotal: number
}
