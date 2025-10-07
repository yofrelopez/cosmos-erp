'use client'

import React, { useState } from 'react';
import { Calculator, Package, Frame, Ruler, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileMenuButton from '@/components/ui/MobileMenuButton';
import { useSidebar } from '@/contexts/SidebarContext';
import { useMoldingFilters, useFilteredMoldings } from '@/hooks/useMoldingFilters';
import { useGlass2mmForFrames } from '@/hooks/useGlass2mmForFrames';
import { useFrameCalculator } from '@/hooks/useFrameCalculator';

interface Dimensions {
  ancho: number;
  alto: number;
}

export default function FriendlyFrameCalculator({ companyId }: { companyId: number }) {
  const router = useRouter();
  const { isCollapsed, isMobile } = useSidebar();
  const [dimensions, setDimensions] = useState<Dimensions>({ ancho: 0, alto: 0 });
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [selectedMolding, setSelectedMolding] = useState<any>(null);
  const [selectedGlass, setSelectedGlass] = useState<any>(null);
  const [isSendingToQuote, setIsSendingToQuote] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Hooks para molduras
  const {
    filters: moldingFilters,
    options: moldingOptions,
    loading: moldingOptionsLoading,
    updateFilter: updateMoldingFilter,
    resetFilters: resetMoldingFilters
  } = useMoldingFilters(companyId);

  const { moldings, loading: moldingsLoading } = useFilteredMoldings(companyId, moldingFilters);

  // Hook para vidrios de 2mm
  const {
    filters: glassFilters,
    options: glassOptions,
    glasses: glasses2mm,
    loading: glassLoading,
    updateFilter: updateGlassFilter,
    resetFilters: resetGlassFilters
  } = useGlass2mmForFrames(companyId);

  // Hook de cálculo
  const calculation = useFrameCalculator(dimensions, selectedMolding, selectedGlass, quantity);

  const handleMoldingFilterChange = (key: string, value: string) => {
    updateMoldingFilter(key as any, value);
    setSelectedMolding(null); // Limpiar selección al cambiar filtros
  };

  const handleGlassFilterChange = (key: string, value: string) => {
    updateGlassFilter(key as any, value);
    setSelectedGlass(null); // Limpiar selección al cambiar filtros
  };

  const handleAddItem = () => {
    if (!selectedMolding || !selectedGlass || !dimensions.ancho || !dimensions.alto) {
      alert('Por favor completa todos los campos: medidas, moldura y vidrio');
      return;
    }

    const description = `Cuadro ${selectedMolding.name} + ${selectedGlass.commercialName} (${dimensions.ancho}×${dimensions.alto}cm)`;

    const newItem = {
      id: Date.now(),
      description,
      quantity,
      unitPrice: calculation.unitPrice,
      total: calculation.totalPrice,
      specifications: {
        dimensions: { ancho: dimensions.ancho, alto: dimensions.alto },
        molding: selectedMolding,
        glass: selectedGlass,
        perimeterM: calculation.perimeterM,
        areaFt2: calculation.areaFt2,
        breakdown: calculation.breakdown
      }
    };

    setItems(prev => [...prev, newItem]);

    let confirmMessage = `✅ Agregado: Cuadro ${selectedMolding.name}\n`;
    confirmMessage += `📏 Perímetro: ${calculation.perimeterM.toFixed(2)}m\n`;
    confirmMessage += `🪟 Área vidrio: ${calculation.areaFt2.toFixed(2)} ft²\n`;
    confirmMessage += `🔲 Moldura: S/ ${calculation.moldingPrice.toFixed(2)}\n`;
    confirmMessage += `🪟 Vidrio: S/ ${calculation.glassPrice.toFixed(2)}\n`;
    confirmMessage += `💰 Precio unitario: S/ ${calculation.unitPrice.toFixed(2)}\n`;
    confirmMessage += `💵 Total: S/ ${calculation.totalPrice.toFixed(2)}`;
    
    alert(confirmMessage);

    // Limpiar selecciones
    setSelectedMolding(null);
    setSelectedGlass(null);
    setDimensions({ ancho: 0, alto: 0 });
    setQuantity(1);
    resetMoldingFilters();
    resetGlassFilters();
  };

  const totalCart = items.reduce((sum, item) => sum + item.total, 0);

  const handleSendToQuote = async () => {
    if (items.length === 0) {
      alert('No hay items en el carrito para enviar');
      return;
    }

    setIsSendingToQuote(true);

    try {
      // Simular operación de procesamiento para mejor UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mapear items del carrito → formato QuoteItem
      const quoteItems = items.map(item => ({
        description: item.description,
        unit: 'pieza',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.total
      }));

      // Obtener items existentes de localStorage 'quoteItems'
      const existingItems = JSON.parse(localStorage.getItem('quoteItems') || '[]');
      
      // Combinar y guardar en localStorage
      const combinedItems = [...existingItems, ...quoteItems];
      localStorage.setItem('quoteItems', JSON.stringify(combinedItems));
      
      // Navegar a cotización con indicador de origen
      router.push('/cotizaciones/nueva?from=calculator');
    } catch (error) {
      console.error('Error enviando a cotización:', error);
      alert('Error al enviar la cotización. Inténtalo nuevamente.');
    } finally {
      setIsSendingToQuote(false);
    }
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
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Calculadora de Cuadros</h1>
                <nav className="text-gray-500 text-xs hidden sm:block">
                  <span>Cotizaciones</span>
                  <span className="mx-1">/</span>
                  <span className="text-blue-800">Calculadora Cuadros</span>
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
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Ruler className="text-purple-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Medidas del cuadro</h2>
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
                    className="w-full text-xl p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                    placeholder="30"
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
                    className="w-full text-xl p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                    placeholder="40"
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
                    className="w-full text-xl p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                  />
                </div>
              </div>

              {dimensions.ancho > 0 && dimensions.alto > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-center">
                      <div className="text-sm text-purple-600 font-medium">Perímetro moldura:</div>
                      <div className="text-xl font-bold text-purple-800">
                        {calculation.perimeterM.toFixed(2)} metros
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-sm text-blue-600 font-medium">Área vidrio:</div>
                      <div className="text-xl font-bold text-blue-800">
                        {calculation.areaFt2.toFixed(2)} pies cuadrados
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selección de moldura */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Frame className="text-purple-500" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">Seleccionar moldura</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Filtro calidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calidad de moldura
                  </label>
                  <select 
                    value={moldingFilters.quality}
                    onChange={(e) => handleMoldingFilterChange('quality', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Todas las calidades</option>
                    {moldingOptions.qualities?.map((quality) => (
                      <option key={quality.value} value={quality.value}>
                        {quality.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro espesor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Espesor
                  </label>
                  <select 
                    value={moldingFilters.thicknessId}
                    onChange={(e) => handleMoldingFilterChange('thicknessId', e.target.value)}
                    disabled={!moldingFilters.quality}
                    className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Todos los espesores</option>
                    {moldingOptions.thicknesses?.map((thickness) => (
                      <option key={thickness.id} value={thickness.id.toString()}>
                        {thickness.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de molduras disponibles */}
              {moldings.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">Molduras disponibles:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {moldings.map((molding) => (
                      <div
                        key={molding.id}
                        onClick={() => setSelectedMolding(molding)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedMolding?.id === molding.id
                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{molding.name}</div>
                        <div className="text-sm text-gray-600">{molding.quality} • {molding.thickness.name}</div>
                        <div className="text-sm font-bold text-purple-600">S/ {molding.pricePerM.toFixed(2)}/metro</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {moldings.length === 0 && !moldingsLoading && moldingFilters.quality && (
                <div className="text-center text-gray-500 py-4">
                  <Frame className="mx-auto mb-2" size={32} />
                  <p>No hay molduras disponibles con estos filtros</p>
                </div>
              )}
            </div>

            {/* Selección de vidrio */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-blue-500">🪟</div>
                <h2 className="text-lg font-semibold text-gray-800">Seleccionar vidrio (2mm)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Filtro familia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de vidrio
                  </label>
                  <select 
                    value={glassFilters.family}
                    onChange={(e) => handleGlassFilterChange('family', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los tipos</option>
                    {glassOptions.families?.map((family) => (
                      <option key={family} value={family}>
                        {family === 'PLANO' ? '🪟 Cristal Normal' : 
                         family === 'CATEDRAL' ? '🏰 Catedral' : 
                         family === 'TEMPLADO' ? '🔥 Templado' : 
                         family === 'ESPEJO' ? '✨ Espejo' : family}
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
                    value={glassFilters.colorType}
                    onChange={(e) => handleGlassFilterChange('colorType', e.target.value)}
                    disabled={!glassFilters.family}
                    className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Todos los tipos</option>
                    {glassOptions.colorTypes?.map((colorType) => (
                      <option key={colorType} value={colorType}>
                        {colorType === 'INCOLORO' ? 'Transparente' : 
                         colorType === 'COLOR' ? 'Con color' : 
                         colorType === 'POLARIZADO' ? 'Polarizado' : 
                         colorType === 'REFLEJANTE' ? 'Reflejante' : colorType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de vidrios disponibles */}
              {glasses2mm.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">Vidrios disponibles (2mm):</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {glasses2mm.map((glass) => (
                      <div
                        key={glass.id}
                        onClick={() => setSelectedGlass(glass)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedGlass?.id === glass.id
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{glass.commercialName}</div>
                        <div className="text-sm text-gray-600">{glass.family} • {glass.colorType}</div>
                        <div className="text-sm font-bold text-blue-600">S/ {glass.unitPrice.toFixed(2)}/ft²</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {glasses2mm.length === 0 && !glassLoading && (
                <div className="text-center text-gray-500 py-4">
                  <div className="text-4xl mb-2">🪟</div>
                  <p>No hay vidrios de 2mm disponibles</p>
                </div>
              )}
            </div>

            {/* Vista previa del cálculo */}
            {selectedMolding && selectedGlass && dimensions.ancho > 0 && dimensions.alto > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <Calculator className="text-green-500" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">Resumen del cuadro</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Moldura */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-xs font-medium text-purple-700 mb-2">MOLDURA</div>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{selectedMolding.name}</div>
                      <div className="text-xs text-purple-600">{calculation.perimeterM.toFixed(2)}m × S/ {selectedMolding.pricePerM.toFixed(2)}</div>
                      <div className="text-lg font-bold text-purple-700">S/ {calculation.moldingPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Vidrio */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-xs font-medium text-blue-700 mb-2">VIDRIO</div>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{selectedGlass.commercialName}</div>
                      <div className="text-xs text-blue-600">{calculation.areaFt2.toFixed(2)}ft² × S/ {selectedGlass.unitPrice.toFixed(2)}</div>
                      <div className="text-lg font-bold text-blue-700">S/ {calculation.glassPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Precio unitario */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-xs font-medium text-green-700 mb-2">PRECIO UNITARIO</div>
                    <div className="space-y-1">
                      <div className="text-xs text-green-600">Moldura + Vidrio</div>
                      <div className="text-xs text-green-600">S/ {calculation.moldingPrice.toFixed(2)} + S/ {calculation.glassPrice.toFixed(2)}</div>
                      <div className="text-lg font-bold text-green-700">S/ {calculation.unitPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Total y botón */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-medium text-gray-700 mb-2">TOTAL ({quantity} cuadro{quantity !== 1 ? 's' : ''})</div>
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-gray-800">S/ {calculation.totalPrice.toFixed(2)}</div>
                      <button
                        onClick={handleAddItem}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-all duration-200 transform hover:scale-105"
                      >
                        ➕ Agregar Cuadro
                      </button>
                    </div>
                  </div>
                </div>
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
              <h2 className="text-lg font-bold text-gray-800">Cuadros seleccionados</h2>
            </div>
          </div>

          {/* Contenido del carrito */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="font-medium text-sm mb-2">{item.specifications.molding.name} + {item.specifications.glass.commercialName}</div>
                    <div className="text-xs text-gray-600 mb-2">
                      📐 {item.specifications.dimensions.ancho} × {item.specifications.dimensions.alto} cm
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      🔲 Moldura: S/ {item.specifications.breakdown.moldingCost.toFixed(2)} • 
                      🪟 Vidrio: S/ {item.specifications.breakdown.glassCost.toFixed(2)}
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
                <p>No hay cuadros seleccionados</p>
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
                  disabled={isSendingToQuote}
                  className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
                    isSendingToQuote 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isSendingToQuote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Enviando...
                    </>
                  ) : (
                    <>🚀 Enviar a Cotización ({items.length})</>
                  )}
                </button>
                
                <button 
                  onClick={() => setItems([])}
                  disabled={isSendingToQuote}
                  className={`font-medium py-3 px-4 rounded-xl transition-all duration-200 ${
                    isSendingToQuote
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-100 hover:bg-red-200 text-red-600'
                  }`}
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
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
                          <div className="font-medium text-sm mb-1">{item.molding.name} + {item.glass.commercialName}</div>
                          <div className="text-xs text-gray-600 mb-2">
                            📐 {item.specifications.dimensions.ancho} × {item.specifications.dimensions.alto} cm
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
                        disabled={isSendingToQuote}
                        className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm ${
                          isSendingToQuote
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {isSendingToQuote ? '🔄 Enviando...' : `🚀 Enviar a Cotización (${items.length})`}
                      </button>
                      
                      <button 
                        onClick={() => setItems([])}
                        disabled={isSendingToQuote}
                        className={`font-medium py-3 px-4 rounded-xl transition-all duration-200 ${
                          isSendingToQuote
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 hover:bg-red-200 text-red-600'
                        }`}
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
    </div>
  );
}