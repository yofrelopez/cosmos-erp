'use client'

import React, { useState } from 'react';
import { Calculator, Package, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileMenuButton from '@/components/ui/MobileMenuButton';
import { useSidebar } from '@/contexts/SidebarContext';
import { useGlassFilters, useFilteredGlasses } from '@/hooks/useGlassFilters';

interface Glass {
  id: number;
  commercialName: string;
  family: string;
  thicknessMM: number;
  colorType: string;
  unitPrice: number;
  price: number;
}

interface Dimensions {
  ancho: number;
  alto: number;
}

// Función para calcular área en pies cuadrados
const calculateAreaFt2 = (ancho: number, alto: number): number => {
  return (ancho * alto) / 929.0304;
};

// Función para redondear hacia arriba a .50 o .00
const roundToHalfOrWhole = (price: number): number => {
  const integerPart = Math.floor(price);
  const decimalPart = price - integerPart;
  
  if (decimalPart === 0) {
    return price;
  } else if (decimalPart <= 0.5) {
    return integerPart + 0.5;
  } else {
    return integerPart + 1;
  }
};

// Función para calcular precio unitario (precio por pieza individual)
const calculateUnitPrice = (pricePerFt2: number, dimensions: Dimensions): number => {
  if (!pricePerFt2 || !dimensions.ancho || !dimensions.alto) return 0;
  const areaFt2 = calculateAreaFt2(dimensions.ancho, dimensions.alto);
  const rawPrice = pricePerFt2 * areaFt2;
  return roundToHalfOrWhole(rawPrice);
};

// Función para calcular precio total (precio unitario × cantidad)
const calculateTotalPrice = (pricePerFt2: number, dimensions: Dimensions, quantity: number): number => {
  if (!pricePerFt2 || !dimensions.ancho || !dimensions.alto || !quantity) return 0;
  const unitPrice = calculateUnitPrice(pricePerFt2, dimensions);
  return Number((unitPrice * quantity).toFixed(2));
};

export default function FriendlyGlassCalculator({ companyId }: { companyId: number }) {
  const router = useRouter();
  const { isCollapsed, isMobile } = useSidebar();
  const [dimensions, setDimensions] = useState<Dimensions>({ ancho: 0, alto: 0 });
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const {
    filters,
    options,
    loading,
    updateFilter,
    resetFilters,
    setSearch
  } = useGlassFilters(companyId);

  const { glasses, loading: glassesLoading } = useFilteredGlasses(companyId, filters);

  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key as keyof typeof filters, value);
  };

  const handleAddItem = (glass: any, totalPrice: number) => {
    const selectedColor = filters.colorId 
      ? options.colors?.find((c: any) => c.id.toString() === filters.colorId)?.name 
      : null;
    
    const selectedTexture = filters.textureId 
      ? options.textures?.find((t: any) => t.id.toString() === filters.textureId)?.name 
      : null;

    let detailedDescription = `${glass.commercialName} (${dimensions.ancho}×${dimensions.alto}cm)`;
    
    if (selectedColor) {
      detailedDescription += ` - Color: ${selectedColor}`;
    }
    
    if (selectedTexture) {
      detailedDescription += ` - Textura: ${selectedTexture}`;
    }

    const calculatedUnitPrice = calculateUnitPrice(glass.unitPrice, dimensions);

    const newItem = {
      id: Date.now(),
      description: detailedDescription,
      quantity,
      unitPrice: calculatedUnitPrice,
      pricePerFt2: glass.unitPrice,
      total: totalPrice,
      glass,
      specifications: {
        colorId: filters.colorId || null,
        colorName: selectedColor || null,
        textureId: filters.textureId || null,
        textureName: selectedTexture || null,
        dimensions: { ancho: dimensions.ancho, alto: dimensions.alto },
        area: calculateAreaFt2(dimensions.ancho, dimensions.alto)
      }
    };
    setItems(prev => [...prev, newItem]);
    
    const areaFt2 = calculateAreaFt2(dimensions.ancho, dimensions.alto);
    let confirmMessage = `✅ Agregado: ${glass.commercialName}\n📏 Área: ${areaFt2.toFixed(2)} ft²\n💰 Precio unitario: S/ ${calculatedUnitPrice.toFixed(2)}\n💵 Total: S/ ${totalPrice.toFixed(2)}`;
    
    if (selectedColor) confirmMessage += `\n🎨 Color: ${selectedColor}`;
    if (selectedTexture) confirmMessage += `\n🏰 Textura: ${selectedTexture}`;
    
    alert(confirmMessage);

    resetFilters();
    setDimensions({ ancho: 0, alto: 0 });
    setQuantity(1);
  };

  const totalCart = items.reduce((sum, item) => sum + item.total, 0);

  const handleSendToQuote = () => {
    if (items.length === 0) {
      alert('No hay items en el carrito para enviar');
      return;
    }

    // 1. Mapear items del carrito → formato QuoteItem
    const quoteItems = items.map(item => ({
      description: item.description,
      unit: 'pieza',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.total
    }));

    // 2. Obtener items existentes de localStorage 'quoteItems'
    const existingItems = JSON.parse(localStorage.getItem('quoteItems') || '[]');
    
    // 3. Combinar y guardar en localStorage
    const combinedItems = [...existingItems, ...quoteItems];
    localStorage.setItem('quoteItems', JSON.stringify(combinedItems));
    
    // 4. Navegar a cotización con indicador de origen
    router.push('/cotizaciones/nueva?from=calculator');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header responsive coherente con COSMOS */}
      <div className={`fixed top-0 right-0 bg-white shadow-sm border-b-4 border-blue-800 z-40 transition-all duration-300 ease-in-out ${
        isMobile 
          ? 'left-0' 
          : isCollapsed 
            ? 'left-16' 
            : 'left-64'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botón hamburguesa integrado - Solo móvil */}
              <div className="lg:hidden">
                <MobileMenuButton />
              </div>
              
              <div className="w-1 h-4 sm:h-6 bg-orange-500 rounded-full"></div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Calculadora de Vidrios</h1>
                <nav className="text-gray-500 text-xs hidden sm:block">
                  <span>Cotizaciones</span>
                  <span className="mx-1">/</span>
                  <span className="text-blue-800">Calculadora Vidrios</span>
                </nav>
              </div>
            </div>
            
            {/* Contador de items en carrito */}
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <span className="text-xs sm:text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full font-medium border border-green-200">
                  {items.length} {items.length === 1 ? 'item' : 'items'} • S/ {totalCart.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal con padding para header fijo */}
      <div className="pt-16 sm:pt-20">
        {/* Layout responsive - Desktop: 2 columnas, Móvil: 1 columna */}
        <div className="lg:flex lg:h-[calc(100vh-80px)]">
        
        {/* COLUMNA IZQUIERDA: Calculadora - Full width en móvil */}
        <div className="flex-1 p-4 lg:overflow-y-auto lg:pb-4 pb-20">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Panel de medidas */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Calculator className="text-blue-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Medidas del vidrio</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📏 Ancho (cm)
                  </label>
                  <input
                    type="number"
                    value={dimensions.ancho || ''}
                    onChange={(e) => setDimensions(prev => ({ ...prev, ancho: Number(e.target.value) }))}
                    className="w-full text-xl p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📐 Alto (cm)
                  </label>
                  <input
                    type="number"
                    value={dimensions.alto || ''}
                    onChange={(e) => setDimensions(prev => ({ ...prev, alto: Number(e.target.value) }))}
                    className="w-full text-xl p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    placeholder="150"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔢 Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xl p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {dimensions.ancho > 0 && dimensions.alto > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-sm text-blue-600 font-medium">Área total:</div>
                    <div className="text-xl font-bold text-blue-800">
                      {calculateAreaFt2(dimensions.ancho, dimensions.alto).toFixed(2)} pies cuadrados
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filtros dinámicos */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <Search className="text-blue-500" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">Filtrar vidrios</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro familia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de vidrio
                  </label>
                  <select 
                    value={filters.family}
                    onChange={(e) => handleFilterChange('family', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los tipos</option>
                    {options.families?.map((family: string) => (
                      <option key={family} value={family}>
                        {family === 'PLANO' ? '🪟 Cristal Normal' : 
                         family === 'CATEDRAL' ? '🏰 Catedral' : 
                         family === 'TEMPLADO' ? '🔥 Templado' : 
                         family === 'ESPEJO' ? '✨ Espejo' : family}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro espesor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grosor (mm)
                  </label>
                  <select 
                    value={filters.thickness}
                    onChange={(e) => handleFilterChange('thickness', e.target.value)}
                    disabled={!filters.family}
                    className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Todos los grosores</option>
                    {options.thicknesses?.map((thickness: number) => (
                      <option key={thickness} value={thickness.toString()}>
                        {thickness}mm
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro tipo de color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de color
                  </label>
                  <select 
                    value={filters.colorType}
                    onChange={(e) => handleFilterChange('colorType', e.target.value)}
                    disabled={!filters.thickness}
                    className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Todos los tipos</option>
                    {options.colorTypes?.map((colorType: string) => (
                      <option key={colorType} value={colorType}>
                        {colorType === 'INCOLORO' ? 'Transparente' : 
                         colorType === 'COLOR' ? 'Con color' : 
                         colorType === 'POLARIZADO' ? 'Polarizado' : 
                         colorType === 'REFLEJANTE' ? 'Reflejante' : colorType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro color específico - Solo si colorType != INCOLORO */}
                {(filters.colorType && filters.colorType !== 'INCOLORO') && options.colors && options.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎨 Color específico
                    </label>
                    <select 
                      value={filters.colorId}
                      onChange={(e) => handleFilterChange('colorId', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Sin especificar color</option>
                      {options.colors?.map((color: {id: number, name: string}) => (
                        <option key={color.id} value={color.id.toString()}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filtro textura - Solo para CATEDRAL */}
                {filters.family === 'CATEDRAL' && options.textures && options.textures.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🏰 Textura específica
                    </label>
                    <select 
                      value={filters.textureId}
                      onChange={(e) => handleFilterChange('textureId', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Sin especificar textura</option>
                      {options.textures?.map((texture: {id: number, name: string}) => (
                        <option key={texture.id} value={texture.id.toString()}>
                          {texture.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Vista previa del vidrio seleccionado */}
            {glasses.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">
                    {glasses[0].family === 'PLANO' ? '🪟' : 
                     glasses[0].family === 'CATEDRAL' ? '🏰' : 
                     glasses[0].family === 'TEMPLADO' ? '🔥' : 
                     glasses[0].family === 'ESPEJO' ? '✨' : '📄'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{glasses[0].commercialName}</h3>
                    <p className="text-sm text-gray-600">{glasses[0].family} • {glasses[0].thicknessMM}mm</p>
                  </div>
                </div>

                {/* Vista horizontal con columnas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Columna 1: Información del producto */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">PRODUCTO</div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{glasses[0].commercialName}</div>
                      <div className="text-xs text-gray-600">{glasses[0].family}</div>
                      <div className="text-xs text-gray-600">{glasses[0].thicknessMM}mm grosor</div>
                      <div className="text-xs text-gray-600">{glasses[0].colorType}</div>
                    </div>
                  </div>

                  {/* Columna 2: Precio de lista */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-xs font-medium text-blue-700 mb-2">PRECIO LISTA</div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        S/ {glasses[0].unitPrice ? glasses[0].unitPrice.toFixed(2) : '0.00'}
                      </div>
                      <div className="text-xs text-blue-500">por pie cuadrado</div>
                    </div>
                  </div>

                  {/* Columna 3: Cálculo por pieza */}
                  <div className={`rounded-lg p-3 border ${
                    dimensions.ancho > 0 && dimensions.alto > 0 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`text-xs font-medium mb-2 ${
                      dimensions.ancho > 0 && dimensions.alto > 0 
                        ? 'text-green-700' 
                        : 'text-gray-500'
                    }`}>
                      PRECIO UNITARIO
                    </div>
                    {dimensions.ancho > 0 && dimensions.alto > 0 ? (
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          S/ {calculateUnitPrice(glasses[0].unitPrice, dimensions).toFixed(2)}
                        </div>
                        <div className="text-xs text-green-500">
                          {calculateAreaFt2(dimensions.ancho, dimensions.alto).toFixed(2)} ft² × S/ {glasses[0].unitPrice.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-sm">Ingresa medidas</div>
                      </div>
                    )}
                  </div>

                  {/* Columna 4: Total y botón */}
                  <div className={`rounded-lg p-3 border ${
                    dimensions.ancho > 0 && dimensions.alto > 0 && quantity > 0
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`text-xs font-medium mb-2 ${
                      dimensions.ancho > 0 && dimensions.alto > 0 && quantity > 0
                        ? 'text-purple-700' 
                        : 'text-gray-500'
                    }`}>
                      TOTAL ({quantity} unidad{quantity !== 1 ? 'es' : ''})
                    </div>
                    {dimensions.ancho > 0 && dimensions.alto > 0 && quantity > 0 ? (
                      <div className="space-y-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            S/ {calculateTotalPrice(glasses[0].unitPrice, dimensions, quantity).toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddItem(glasses[0], calculateTotalPrice(glasses[0].unitPrice, dimensions, quantity))}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-all duration-200 transform hover:scale-105"
                        >
                          ➕ Agregar
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-sm">Complete los datos</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información adicional de especificaciones si están seleccionadas */}
                {(filters.colorId || filters.textureId) && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-800 mb-2">
                      📋 Especificaciones adicionales para cotización:
                    </div>
                    <div className="flex gap-4 text-sm text-yellow-700">
                      {filters.colorId && (
                        <div>🎨 Color: {options.colors?.find((c: any) => c.id.toString() === filters.colorId)?.name}</div>
                      )}
                      {filters.textureId && (
                        <div>🏰 Textura: {options.textures?.find((t: any) => t.id.toString() === filters.textureId)?.name}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mensaje cuando no hay vidrios disponibles */}
            {glasses.length === 0 && !glassesLoading && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron vidrios</h3>
                <p className="text-gray-500">Ajusta los filtros para ver productos disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Carrito - Desktop fijo, Móvil bottom sheet */}
        <div className="hidden lg:flex lg:w-80 bg-white border-l border-gray-200 flex-col">
          {/* Header del carrito */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Package className="text-green-500" size={24} />
              <h2 className="text-lg font-bold text-gray-800">Tu selección</h2>
            </div>
          </div>

          {/* Contenido del carrito */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="font-medium text-sm mb-1">{item.glass.commercialName}</div>
                    <div className="text-xs text-gray-600 mb-2">
                      📐 {item.specifications.dimensions.ancho} × {item.specifications.dimensions.alto} cm
                      {item.specifications.colorName && (
                        <div>🎨 {item.specifications.colorName}</div>
                      )}
                      {item.specifications.textureName && (
                        <div>🏰 {item.specifications.textureName}</div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-green-600">S/ {item.unitPrice.toFixed(2)} × {item.quantity}</div>
                        <div className="font-bold text-green-600">S/ {item.total.toFixed(2)}</div>
                      </div>
                      <button
                        onClick={() => setItems(items.filter(i => i.id !== item.id))}
                        className="text-red-500 hover:text-red-700 text-sm p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Package className="mx-auto mb-4" size={48} />
                <p>No hay items seleccionados</p>
              </div>
            )}
          </div>

          {/* Footer del carrito */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-green-600">S/ {totalCart.toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleSendToQuote}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm"
                >
                  🚀 Enviar a Cotización ({items.length})
                </button>
                
                <button 
                  onClick={() => setItems([])}
                  className="bg-red-100 hover:bg-red-200 text-red-600 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
        
        {/* FAB y Bottom Sheet para móvil */}
        <div className="lg:hidden">
          {/* FAB - Botón flotante */}
          {items.length > 0 && (
            <button
              onClick={() => setShowMobileCart(!showMobileCart)}
              className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg z-50 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Package size={20} />
                <span className="bg-white text-green-600 text-xs font-bold px-2 py-1 rounded-full">
                  {items.length}
                </span>
              </div>
            </button>
          )}

          {/* Bottom Sheet - Carrito móvil */}
          {showMobileCart && (
            <div className="fixed inset-0 z-40">
              {/* Overlay */}
              <div 
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileCart(false)}
              />
              
              {/* Bottom Sheet */}
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                {/* Header del bottom sheet */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="text-green-500" size={24} />
                    <h2 className="text-lg font-bold text-gray-800">Tu selección</h2>
                  </div>
                  <button
                    onClick={() => setShowMobileCart(false)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    ✕
                  </button>
                </div>

                {/* Contenido del carrito */}
                <div className="flex-1 overflow-y-auto p-4">
                  {items.length > 0 ? (
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="p-3 bg-gray-50 rounded-lg border">
                          <div className="font-medium text-sm mb-1">{item.glass.commercialName}</div>
                          <div className="text-xs text-gray-600 mb-2">
                            📐 {item.specifications.dimensions.ancho} × {item.specifications.dimensions.alto} cm
                            {item.specifications.colorName && (
                              <div>🎨 {item.specifications.colorName}</div>
                            )}
                            {item.specifications.textureName && (
                              <div>🏰 {item.specifications.textureName}</div>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-xs text-green-600">S/ {item.unitPrice.toFixed(2)} × {item.quantity}</div>
                              <div className="font-bold text-green-600">S/ {item.total.toFixed(2)}</div>
                            </div>
                            <button
                              onClick={() => setItems(items.filter(i => i.id !== item.id))}
                              className="text-red-500 hover:text-red-700 text-sm p-2"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Package className="mx-auto mb-4" size={48} />
                      <p>No hay items seleccionados</p>
                    </div>
                  )}
                </div>

                {/* Footer del bottom sheet */}
                {items.length > 0 && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-xl font-bold text-green-600">S/ {totalCart.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSendToQuote}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm"
                      >
                        🚀 Enviar a Cotización ({items.length})
                      </button>
                      
                      <button 
                        onClick={() => setItems([])}
                        className="bg-red-100 hover:bg-red-200 text-red-600 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}