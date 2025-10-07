import { useMemo } from 'react'

interface Dimensions {
  ancho: number
  alto: number
}

interface Molding {
  id: number
  name: string
  quality: string
  pricePerM: number
  thickness: {
    id: number
    name: string
  }
}

interface Glass {
  id: number
  commercialName: string
  family: string
  thicknessMM: number
  colorType: string
  unitPrice: number
}

// Función para calcular área en pies cuadrados
const calculateAreaFt2 = (ancho: number, alto: number): number => {
  return (ancho * alto) / 929.0304
}

// Función para calcular perímetro en metros
const calculatePerimeterM = (ancho: number, alto: number): number => {
  return ((ancho + alto) * 2) / 100 // convertir cm a metros
}

// Función para redondear hacia arriba a .50 o .00
const roundToHalfOrWhole = (price: number): number => {
  const integerPart = Math.floor(price)
  const decimalPart = price - integerPart
  
  if (decimalPart === 0) {
    return price
  } else if (decimalPart <= 0.5) {
    return integerPart + 0.5
  } else {
    return integerPart + 1
  }
}

// Función para calcular precio de moldura
const calculateMoldingPrice = (dimensions: Dimensions, molding: Molding): number => {
  if (!dimensions.ancho || !dimensions.alto || !molding?.pricePerM) return 0
  
  const perimeterM = calculatePerimeterM(dimensions.ancho, dimensions.alto)
  return perimeterM * molding.pricePerM
}

// Función para calcular precio de vidrio (solo 2mm)
const calculateGlassPrice = (dimensions: Dimensions, glass: Glass): number => {
  if (!dimensions.ancho || !dimensions.alto || !glass?.unitPrice) return 0
  
  const areaFt2 = calculateAreaFt2(dimensions.ancho, dimensions.alto)
  const rawPrice = glass.unitPrice * areaFt2
  return roundToHalfOrWhole(rawPrice)
}

// Función para calcular precio total del cuadro
const calculateFramePrice = (
  dimensions: Dimensions, 
  molding: Molding | null, 
  glass: Glass | null
): number => {
  if (!dimensions.ancho || !dimensions.alto) return 0
  
  const moldingPrice = molding ? calculateMoldingPrice(dimensions, molding) : 0
  const glassPrice = glass ? calculateGlassPrice(dimensions, glass) : 0
  
  return moldingPrice + glassPrice
}

export interface FrameCalculationResult {
  moldingPrice: number
  glassPrice: number
  unitPrice: number
  totalPrice: number
  perimeterM: number
  areaFt2: number
  breakdown: {
    moldingCost: number
    glassCost: number
    perimeterUsed: number
    areaUsed: number
  }
}

export function useFrameCalculator(
  dimensions: Dimensions,
  molding: Molding | null,
  glass: Glass | null,
  quantity: number = 1
): FrameCalculationResult {
  
  return useMemo(() => {
    const moldingPrice = molding ? calculateMoldingPrice(dimensions, molding) : 0
    const glassPrice = glass ? calculateGlassPrice(dimensions, glass) : 0
    const unitPrice = moldingPrice + glassPrice
    const totalPrice = unitPrice * quantity
    const perimeterM = calculatePerimeterM(dimensions.ancho, dimensions.alto)
    const areaFt2 = calculateAreaFt2(dimensions.ancho, dimensions.alto)

    return {
      moldingPrice,
      glassPrice,
      unitPrice,
      totalPrice,
      perimeterM,
      areaFt2,
      breakdown: {
        moldingCost: moldingPrice,
        glassCost: glassPrice,
        perimeterUsed: perimeterM,
        areaUsed: areaFt2
      }
    }
  }, [dimensions.ancho, dimensions.alto, molding?.pricePerM, glass?.unitPrice, quantity])
}

// Helper functions exportadas para uso directo
export {
  calculateAreaFt2,
  calculatePerimeterM,
  calculateMoldingPrice,
  calculateGlassPrice,
  calculateFramePrice,
  roundToHalfOrWhole
}