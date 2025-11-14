import { Quote, Client, QuoteItem, QuoteItemImage, Observation, user } from "@prisma/client"

export type QuoteWithClientAndItems = Quote & {
  client: Client | null
  items: (QuoteItem & {
    images: QuoteItemImage[]
  })[]
  observations: Observation[]
  createdBy: user | null
}




export type BastidorCategory = "BASTIDOR";

export interface ThicknessPricing {
  id: number;
  name: string;
  category: BastidorCategory;
  pricePerM: number;
}

export interface BastidorItemInput {
  widthCm: number;
  heightCm: number;
  quantity: number;
  thicknessId: number;
  hasInnerCrossbars: boolean;
  crossbarCount: number; // cantidad de travesaños
}

export interface BastidorPriceResult {
  unitPrice: number; // precio por unidad de bastidor
  totalPrice: number; // precio total (unitPrice * quantity)
  metersUsed: number; // metros lineales usados
  breakdown: {
    perimeterM: number;
    crossbarsM: number;
    pricePerM: number;
  };
}


export interface FrameItemInput {
  companyId: number;
  moldingId: number;
  widthCm: number;
  heightCm: number;
  thicknessId?: number | null;
  matboardId?: number | null;
  backingId?: number | null;
  accessories?: Array<{ id: number; qty: number }>;
  quantity: number;
  useInnerMolding?: boolean;
}

export interface FramePriceResult {
  unitPrice: number;
  total: number;
  breakdown: {
    moldingCost: number;
    glassCost: number;
    matboardCost: number;
    backingCost: number;
    accessoriesCost: number;
  };
}

// Serialized types for Pricing with Decimal fields converted to number
export interface SerializedPricingAccessory {
  id: number;
  name: string;
  pricePerUnit: number;
  unit: string;
  companyId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedPricingMatboard {
  id: number;
  name: string;
  pricePerFt2: number;
  thicknessMM: number;
  companyId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedPricingBacking {
  id: number;
  name: string;
  pricePerFt2: number;
  thicknessMM: number;
  companyId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedPricingThickness {
  id: number;
  name: string;
  category: string;
  pricePerM: number;
  companyId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedPricingMolding {
  id: number;
  name: string;
  pricePerM: number;
  widthCM: number;
  heightCM: number;
  companyId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Nuevo tipo unificado para precios de vidrios
export interface SerializedPricingGlass {
  id: number;
  commercialName: string;
  family: string;
  thicknessMM: number;
  colorType: string;        // INCOLORO, COLOR, POLARIZADO, REFLEJANTE
  colorId: number | null;   // Referencia a tabla Color
  colorName: string | null; // Nombre del color específico
  price: number;
  companyId: number;
  isActive: boolean;
  validFrom: string;
  validTo: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tipo para colores
export interface SimpleColor {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo para catálogo simple de texturas
export interface SimpleTexture {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}
