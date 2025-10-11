'use client'

import React, { useState, useEffect } from 'react';
import { Calculator, Package, Frame, Ruler, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileMenuButton from '@/components/ui/MobileMenuButton';
import { useSidebar } from '@/contexts/SidebarContext';
import { useMoldingFilters, useFilteredMoldings } from '@/hooks/useMoldingFilters';
import { useFrameGlasses } from '@/hooks/useFrameGlasses';
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
  const [activeGlassTab, setActiveGlassTab] = useState<'vidrio' | 'espejo'>('vidrio');
  const [userChangedTab, setUserChangedTab] = useState(false);

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

  // Hook para vidrios de cuadros
  const {
    glasses: frameGlasses,
    groupedGlasses,
    selectedGlass,
    loading: glassLoading,
    selectGlass,
    resetSelection: resetGlassSelection
  } = useFrameGlasses(companyId);

  // Adaptador para el hook de cálculo
  const adaptedGlass = selectedGlass ? {
    id: selectedGlass.id,
    commercialName: selectedGlass.name,
    family: 'PLANO' as const,
    thicknessMM: selectedGlass.thickness,
    colorType: 'INCOLORO' as const,
    unitPrice: selectedGlass.unitPrice
  } : null;

  // Hook de cálculo
  const calculation = useFrameCalculator(dimensions, selectedMolding, adaptedGlass, quantity);

  const handleMoldingFilterChange = (key: string, value: string) => {
    updateMoldingFilter(key as any, value);
    setSelectedMolding(null); // Limpiar selección al cambiar filtros
  };

  // Auto-seleccionar moldura cuando solo haya una disponible
  useEffect(() => {
    if (moldings.length === 1 && !selectedMolding) {
      setSelectedMolding(moldings[0]);
      console.log('🎯 Auto-selected single molding:', moldings[0].name);
    }
  }, [moldings, selectedMolding]);

  // Auto-cambiar tab cuando se selecciona un vidrio de diferente categoría (solo si no cambió manualmente)
  useEffect(() => {
    if (selectedGlass && !userChangedTab) {
      const newTab = selectedGlass.category === 'VIDRIO' ? 'vidrio' : 'espejo';
      if (activeGlassTab !== newTab) {
        setActiveGlassTab(newTab);
        // Auto-switched to match selected glass category
      }
    }
  }, [selectedGlass, userChangedTab, activeGlassTab]);



  // Ya no necesitamos handleGlassFilterChange - selección directa

  const handleAddItem = () => {
    if (!selectedMolding || !selectedGlass || !dimensions.ancho || !dimensions.alto) {
      alert('Por favor completa todos los campos: medidas, moldura y vidrio');
      return;
    }

    // Construir descripción enriquecida con textura y color
    let moldingDescription = selectedMolding.name;
    
    // Agregar textura si está seleccionada
    const selectedTexture = moldingFilters.texture ? moldingOptions.textures?.find(t => t.id.toString() === moldingFilters.texture) : null;
    if (selectedTexture) {
      moldingDescription += ` - ${selectedTexture.name}`;
    }
    
    // Agregar color si está seleccionado
    const selectedColor = moldingFilters.color ? moldingOptions.colors?.find(c => c.id.toString() === moldingFilters.color) : null;
    if (selectedColor) {
      moldingDescription += ` - ${selectedColor.name}`;
    }

    // Construir descripción del vidrio con prefijo apropiado
    const glassDescription = selectedGlass.category === 'VIDRIO' 
      ? `Vidrio ${selectedGlass.name}`
      : selectedGlass.name;
    
    const description = `Cuadro ${moldingDescription} + ${glassDescription} (${dimensions.ancho}×${dimensions.alto}cm)`;

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
        texture: selectedTexture,
        color: selectedColor,
        perimeterM: calculation.perimeterM,
        areaFt2: calculation.areaFt2,
        breakdown: calculation.breakdown
      }
    };

    setItems(prev => [...prev, newItem]);

    let confirmMessage = `✅ Agregado: Cuadro ${moldingDescription}\n`;
    confirmMessage += `📏 Perímetro: ${calculation.perimeterM.toFixed(2)}m\n`;
    confirmMessage += `🪟 Área vidrio: ${calculation.areaFt2.toFixed(2)} ft²\n`;
    confirmMessage += `🔲 Moldura: S/ ${calculation.moldingPrice.toFixed(2)}\n`;
    confirmMessage += `🪟 Vidrio: S/ ${calculation.glassPrice.toFixed(2)}\n`;
    confirmMessage += `💰 Precio unitario: S/ ${calculation.unitPrice.toFixed(2)}\n`;
    confirmMessage += `💵 Total: S/ ${calculation.totalPrice.toFixed(2)}`;
    
    alert(confirmMessage);

    // Limpiar selecciones
    setSelectedMolding(null);
    resetGlassSelection();
    setDimensions({ ancho: 0, alto: 0 });
    setQuantity(1);
    resetMoldingFilters();
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

      // Mapear items del carrito → formato QuoteItem correcto para API
      const quoteItems = items.map(item => ({
        description: item.description,
        unit: 'pieza',
        quantity: item.quantity,
        unitPrice: item.unitPrice
        // Nota: no incluimos subtotal ya que el API lo calcula automáticamente
      }));

      // Obtener items existentes de localStorage 'quoteItems'
      const existingItems = JSON.parse(localStorage.getItem('quoteItems') || '[]');
      
      // Combinar y guardar en localStorage
      const combinedItems = [...existingItems, ...quoteItems];
      localStorage.setItem('quoteItems', JSON.stringify(combinedItems));
      
      // Navegar a cotización con indicador de origen
      router.push('/admin/cotizaciones/nueva?from=calculator');
    } catch (error) {
      console.error('Error enviando a cotización:', error);
      alert('Error al enviar la cotización. Inténtalo nuevamente.');
    } finally {
      setIsSendingToQuote(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating cart counter - Solo visible cuando hay items */}
      {items.length > 0 && (
        <div className="fixed top-3 right-3 z-50 lg:hidden">
          <div className="bg-purple-500/90 backdrop-blur text-white rounded-lg px-3 py-1.5 shadow-sm border border-purple-400/20">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Package size={14} />
              <span>{items.length} • S/ {totalCart.toFixed(0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal optimizado */}
      <div>
        {/* Layout responsive - Desktop: 2 columnas, Móvil: 1 columna */}
        <div className="lg:flex lg:h-[calc(100vh-120px)]">
        
        {/* COLUMNA IZQUIERDA: Calculadora - Full width en móvil */}
        <div className="flex-1 px-4 pt-2 pb-20 lg:overflow-y-auto lg:pb-4">
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* Panel de medidas */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="text-purple-500" size={20} />
                <h2 className="text-lg font-semibold text-gray-700">Medidas del cuadro</h2>
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
                    className="w-full text-xl p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-400"
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
                    className="w-full text-xl p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-400"
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
                    className="w-full text-xl p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>


            </div>

            {/* Selección de moldura */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Frame className="text-purple-500" size={18} />
                <h2 className="text-base font-medium text-gray-600">Seleccionar moldura</h2>
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
                    {moldingOptions.qualities?.map((quality, index) => (
                      <option key={`molding-quality-${quality.value}-${index}`} value={quality.value}>
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
                    {moldingOptions.thicknesses?.map((thickness, index) => (
                      <option key={`molding-thickness-${thickness.id}-${index}`} value={thickness.id.toString()}>
                        {thickness.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro textura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Textura <span className="text-xs text-gray-500">(decorativo)</span>
                  </label>
                  <select 
                    value={moldingFilters.texture}
                    onChange={(e) => handleMoldingFilterChange('texture', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Todas las texturas</option>
                    {moldingOptions.textures?.map((texture, index) => (
                      <option key={`molding-texture-${texture.id}-${index}`} value={texture.id.toString()}>
                        {texture.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color <span className="text-xs text-gray-500">(decorativo)</span>
                  </label>
                  <select 
                    value={moldingFilters.color}
                    onChange={(e) => handleMoldingFilterChange('color', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Todos los colores</option>
                    {moldingOptions.colors?.map((color, index) => (
                      <option key={`molding-color-${color.id}-${index}`} value={color.id.toString()}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


            </div>

            {/* Selección de vidrio */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-blue-500">🪟</div>
                <h2 className="text-base font-medium text-gray-600">Seleccionar vidrio</h2>
              </div>
              
              {frameGlasses.length > 0 && (
                <>
                  {/* Tabs de Vidrio/Espejo */}
                  <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setActiveGlassTab('vidrio');
                        setUserChangedTab(true);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        activeGlassTab === 'vidrio'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🪟 Vidrios ({groupedGlasses.vidrios.length})
                    </button>
                    <button
                      onClick={() => {
                        setActiveGlassTab('espejo');
                        setUserChangedTab(true);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        activeGlassTab === 'espejo'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      ✨ Espejos ({groupedGlasses.espejos.length})
                    </button>
                  </div>

                  {/* Contenido del tab activo */}
                  <div>
                    {/* TAB VIDRIOS */}
                    <div className={`${activeGlassTab === 'vidrio' ? 'block' : 'hidden'}`}>
                      {groupedGlasses.vidrios.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {groupedGlasses.vidrios.map((glass, index) => (
                            <div
                              key={`frame-vidrio-${glass.id}-${index}`}
                              onClick={() => selectGlass(glass)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedGlass?.id === glass.id
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                              } ${glass.isDefault ? 'ring-1 ring-green-300 bg-green-50/30' : ''}`}
                            >
                              <div className="space-y-2">
                                <div className="font-medium text-gray-900 text-sm leading-tight">
                                  {glass.name}
                                  {glass.isDefault && (
                                    <span className="block text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-1 w-fit">
                                      Predeterminado
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-600">{glass.thickness}mm</div>
                                  <div className="text-sm font-bold text-blue-600">S/ {glass.unitPrice.toFixed(2)}/ft²</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <div className="text-4xl mb-2">🪟</div>
                          <p>No hay vidrios disponibles</p>
                        </div>
                      )}
                    </div>

                    {/* TAB ESPEJOS */}
                    <div className={`${activeGlassTab === 'espejo' ? 'block' : 'hidden'}`}>
                      {groupedGlasses.espejos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {groupedGlasses.espejos.map((glass, index) => (
                            <div
                              key={`frame-espejo-${glass.id}-${index}`}
                              onClick={() => selectGlass(glass)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedGlass?.id === glass.id
                                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="font-medium text-gray-900 text-sm leading-tight">{glass.name}</div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-600">{glass.thickness}mm</div>
                                  <div className="text-sm font-bold text-purple-600">S/ {glass.unitPrice.toFixed(2)}/ft²</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <div className="text-4xl mb-2">✨</div>
                          <p>No hay espejos disponibles</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {frameGlasses.length === 0 && !glassLoading && (
                <div className="text-center text-gray-500 py-4">
                  <div className="text-4xl mb-2">🪟</div>
                  <p>No hay vidrios disponibles para cuadros</p>
                </div>
              )}
              
              {glassLoading && (
                <div className="text-center text-gray-500 py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p>Cargando vidrios...</p>
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
                      <div className="font-medium text-sm">{selectedGlass.name}</div>
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
                {items.map((item, index) => (
                  <div key={`cart-item-${item.id}-${index}`} className="p-3 bg-gray-50 rounded-lg border">
                    {/* Título principal con descripción completa */}
                    <div className="font-medium text-sm mb-2 text-gray-800">
                      {item.description}
                    </div>
                    
                    {/* Detalles de moldura con textura y color */}
                    <div className="space-y-1 mb-3">
                      <div className="text-xs text-gray-600">
                        🔲 <strong>Moldura:</strong> {item.specifications.molding.name}
                        {item.specifications.molding.quality && ` (${item.specifications.molding.quality})`}
                      </div>
                      
                      {item.specifications.texture && (
                        <div className="text-xs text-gray-600">
                          🎨 <strong>Textura:</strong> {item.specifications.texture.name}
                        </div>
                      )}
                      
                      {item.specifications.color && (
                        <div className="text-xs text-gray-600">
                          🌈 <strong>Color:</strong> {item.specifications.color.name}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-600">
                        🪟 <strong>Vidrio:</strong> {item.specifications.glass.category === 'VIDRIO' ? `Vidrio ${item.specifications.glass.name}` : item.specifications.glass.name}
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        📐 <strong>Dimensiones:</strong> {item.specifications.dimensions.ancho} × {item.specifications.dimensions.alto} cm
                      </div>
                    </div>
                    
                    {/* Desglose de precios */}
                    <div className="text-xs text-gray-500 mb-2 space-y-1">
                      <div>• Moldura: S/ {item.specifications.breakdown.moldingCost.toFixed(2)}</div>
                      <div>• Vidrio: S/ {item.specifications.breakdown.glassCost.toFixed(2)}</div>
                      <div className="border-t pt-1">
                        <strong>Precio unitario: S/ {item.unitPrice.toFixed(2)}</strong>
                      </div>
                    </div>
                    
                    {/* Total y acciones */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-green-600">Cantidad: {item.quantity}</div>
                        <div className="font-bold text-green-600 text-lg">S/ {item.total.toFixed(2)}</div>
                      </div>
                      <button
                        onClick={() => setItems(items.filter(i => i.id !== item.id))}
                        className="text-red-500 hover:text-red-700 text-sm p-2 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar item"
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
                      {items.map((item, index) => (
                        <div key={`mobile-cart-item-${item.id}-${index}`} className="p-3 bg-gray-50 rounded-lg border">
                          {/* Título principal con descripción completa */}
                          <div className="font-medium text-sm mb-2 text-gray-800">
                            {item.description}
                          </div>
                          
                          {/* Detalles compactos para móvil */}
                          <div className="space-y-1 mb-2">
                            <div className="text-xs text-gray-600">
                              🔲 {item.specifications.molding.name}
                              {item.specifications.texture && ` - ${item.specifications.texture.name}`}
                              {item.specifications.color && ` - ${item.specifications.color.name}`}
                            </div>
                            
                            <div className="text-xs text-gray-600">
                              🪟 {item.specifications.glass.category === 'VIDRIO' ? `Vidrio ${item.specifications.glass.name}` : item.specifications.glass.name}
                            </div>
                            
                            <div className="text-xs text-gray-600">
                              📐 {item.specifications.dimensions.ancho} × {item.specifications.dimensions.alto} cm
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-xs text-gray-500">Cantidad: {item.quantity}</div>
                              <div className="font-bold text-green-600">S/ {item.total.toFixed(2)}</div>
                            </div>
                            <button
                              onClick={() => setItems(items.filter(i => i.id !== item.id))}
                              className="text-red-500 hover:text-red-700 text-sm p-2 hover:bg-red-50 rounded-md"
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