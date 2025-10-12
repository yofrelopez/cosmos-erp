'use client'

import React, { useState } from 'react';
import { Calculator, Package, Search, Home, ChevronRight, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileMenuButton from '@/components/ui/MobileMenuButton';
import { useSidebar } from '@/contexts/SidebarContext';

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
  const [isSendingToQuote, setIsSendingToQuote] = useState(false);
  const [activeTab, setActiveTab] = useState('calc'); // Para navegación móvil

  // Estado para controlar el modal de precios
  const [showPricesModal, setShowPricesModal] = useState(false);
  const [allGlasses, setAllGlasses] = useState<any[]>([]);
  const [loadingGlasses, setLoadingGlasses] = useState(false);
  const [activeGlassTab, setActiveGlassTab] = useState('PLANO');
  
  // Estado para modal de especificaciones adicionales
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [selectedGlass, setSelectedGlass] = useState<any>(null);
  const [availableColors, setAvailableColors] = useState<any[]>([]);
  const [availableTextures, setAvailableTextures] = useState<any[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [selectedTextureId, setSelectedTextureId] = useState<string>('');
  
  // Estado para feedback visual de selección
  const [processingGlassId, setProcessingGlassId] = useState<number | null>(null);
  const [loadingSpecs, setLoadingSpecs] = useState(false);

  const handleAddItem = (glass: any, totalPrice: number, selectedColor?: any, selectedTexture?: any) => {
    const calculatedUnitPrice = calculateUnitPrice(glass.unitPrice, dimensions);
    let detailedDescription = `${glass.commercialName} (${dimensions.ancho}×${dimensions.alto}cm) - ${glass.thicknessMM}mm`;
    
    if (selectedColor) {
      detailedDescription += ` - Color: ${selectedColor.name}`;
    }
    
    if (selectedTexture) {
      detailedDescription += ` - Textura: ${selectedTexture.name}`;
    }

    const newItem = {
      id: Date.now(),
      description: detailedDescription,
      quantity,
      unitPrice: calculatedUnitPrice,
      pricePerFt2: glass.unitPrice,
      total: totalPrice,
      glass,
      specifications: {
        dimensions: { ancho: dimensions.ancho, alto: dimensions.alto },
        area: calculateAreaFt2(dimensions.ancho, dimensions.alto),
        colorId: selectedColor?.id || null,
        colorName: selectedColor?.name || null,
        textureId: selectedTexture?.id || null,
        textureName: selectedTexture?.name || null
      }
    };
    setItems(prev => [...prev, newItem]);

    // Limpiar campos para nuevo cálculo
    setDimensions({ ancho: 0, alto: 0 });
    setQuantity(1);
  };

  // Función para determinar si un vidrio necesita especificaciones adicionales
  const needsAdditionalSpecs = (glass: any) => {
    // Necesita color específico si es COLOR, POLARIZADO o REFLEJANTE
    const needsColor = glass.colorType === 'COLOR' || glass.colorType === 'POLARIZADO' || glass.colorType === 'REFLEJANTE';
    // Necesita textura si es CATEDRAL
    const needsTexture = glass.family === 'CATEDRAL';
    return needsColor || needsTexture;
  };

  // Función para obtener opciones adicionales (colores/texturas)
  const fetchAdditionalOptions = async (glass: any) => {
    try {
      // Obtener colores si es necesario
      if (glass.colorType === 'COLOR' || glass.colorType === 'POLARIZADO' || glass.colorType === 'REFLEJANTE') {
        const colorResponse = await fetch(`/api/calculator/glass-options?companyId=${companyId}&family=${glass.family}&thickness=${glass.thicknessMM}&colorType=${glass.colorType}`);
        if (colorResponse.ok) {
          const colorData = await colorResponse.json();
          setAvailableColors(colorData.colors || []);
        }
      }
      
      // Obtener texturas si es CATEDRAL
      if (glass.family === 'CATEDRAL') {
        const textureResponse = await fetch(`/api/calculator/glass-options?companyId=${companyId}&family=${glass.family}&thickness=${glass.thicknessMM}&colorType=${glass.colorType}`);
        if (textureResponse.ok) {
          const textureData = await textureResponse.json();
          setAvailableTextures(textureData.textures || []);
        }
      }
    } catch (error) {
      console.error('Error fetching additional options:', error);
    }
  };

  // Función para seleccionar un vidrio desde el modal
  const handleSelectGlass = async (glass: any) => {
    // Marcar como procesando
    setProcessingGlassId(glass.id);
    
    try {
      if (needsAdditionalSpecs(glass)) {
        // Necesita especificaciones adicionales
        setLoadingSpecs(true);
        setSelectedGlass(glass);
        setSelectedColorId('');
        setSelectedTextureId('');
        setAvailableColors([]);
        setAvailableTextures([]);
        await fetchAdditionalOptions(glass);
        setLoadingSpecs(false);
        setShowSpecsModal(true);
      } else {
        // No necesita especificaciones, agregar directamente
        await new Promise(resolve => setTimeout(resolve, 500)); // Pequeña pausa para UX
        const totalPrice = calculateTotalPrice(glass.unitPrice, dimensions, quantity);
        handleAddItem(glass, totalPrice);
        setShowPricesModal(false);
      }
    } catch (error) {
      console.error('Error processing glass selection:', error);
    } finally {
      setProcessingGlassId(null);
    }
  };

  // Función para confirmar la selección con especificaciones
  const handleConfirmWithSpecs = () => {
    if (!selectedGlass) return;
    
    const selectedColor = availableColors.find(c => c.id.toString() === selectedColorId);
    const selectedTexture = availableTextures.find(t => t.id.toString() === selectedTextureId);
    
    const totalPrice = calculateTotalPrice(selectedGlass.unitPrice, dimensions, quantity);
    handleAddItem(selectedGlass, totalPrice, selectedColor, selectedTexture);
    
    setShowSpecsModal(false);
    setShowPricesModal(false);
  };

  // Función para organizar vidrios por familia
  const getGlassesByFamily = (family: string) => {
    return allGlasses
      .filter(glass => {
        // Para la pestaña PLANO, excluir polarizados y reflejantes
        if (family === 'PLANO') {
          return glass.family === family && 
                 glass.colorType !== 'POLARIZADO' && 
                 glass.colorType !== 'REFLEJANTE';
        }
        // Para la pestaña POLARIZADO, buscar vidrios con colorType POLARIZADO
        if (family === 'POLARIZADO') {
          return glass.colorType === 'POLARIZADO';
        }
        // Para la pestaña REFLEJANTE, buscar vidrios con colorType REFLEJANTE
        if (family === 'REFLEJANTE') {
          return glass.colorType === 'REFLEJANTE';
        }
        // Para el resto de familias, filtrar normalmente por family
        return glass.family === family;
      })
      .sort((a, b) => a.unitPrice - b.unitPrice); // Ordenar por precio de menor a mayor
  };

  // Familias de vidrios disponibles
  const glassCategories = [
    { id: 'PLANO', name: 'Plano', icon: '🪟' },
    { id: 'CATEDRAL', name: 'Catedral', icon: '🏰' },
    { id: 'POLARIZADO', name: 'Polarizado', icon: '🕶️' },
    { id: 'REFLEJANTE', name: 'Reflejante', icon: '🔮' },
    { id: 'ESPEJO', name: 'Espejo', icon: '✨' },
    { id: 'TEMPLADO', name: 'Templado', icon: '🔥' }
  ];

  const totalCart = items.reduce((sum, item) => sum + item.total, 0);

  // Función para obtener todos los vidrios cuando se abre el modal
  const fetchAllGlasses = async () => {
    if (!dimensions.ancho || !dimensions.alto || !quantity) return;
    
    setLoadingGlasses(true);
    try {
      const response = await fetch(`/api/calculator/glasses?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setAllGlasses(data);
      } else {
        console.error('Error fetching glasses:', response.status);
        setAllGlasses([]);
      }
    } catch (error) {
      console.error('Error fetching all glasses:', error);
      setAllGlasses([]);
    } finally {
      setLoadingGlasses(false);
    }
  };

  const handleSendToQuote = async () => {
    if (items.length === 0) {
      alert('No hay items en el carrito para enviar');
      return;
    }

    if (isSendingToQuote) return;

    setIsSendingToQuote(true);

    try {
      const quoteItems = items.map(item => ({
        description: item.description,
        unit: 'pieza',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.total
      }));

      const existingItems = JSON.parse(localStorage.getItem('quoteItems') || '[]');
      const combinedItems = [...existingItems, ...quoteItems];
      localStorage.setItem('quoteItems', JSON.stringify(combinedItems));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.push('/admin/cotizaciones/nueva?from=calculator');
    } catch (error) {
      console.error('Error al enviar a cotización:', error);
      alert('Error al enviar a cotización. Inténtalo nuevamente.');
      setIsSendingToQuote(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER INTEGRADO COMPACTO */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        {/* Breadcrumbs compactos */}
        <nav className="flex items-center text-sm text-gray-600 mb-2">
          <Link href="/admin" className="hover:text-blue-600 flex items-center gap-1">
            <Home size={14} />
            Admin
          </Link>
          <ChevronRight size={14} className="mx-1" />
          <Link href="/admin/cotizaciones" className="hover:text-blue-600">
            Cotizaciones
          </Link>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-gray-900 font-medium">Calculadora Vidrios</span>
        </nav>
        
        {/* Header con menú móvil */}
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <Calculator className="text-blue-500" size={24} />
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Calculadora de Vidrios</h1>
            <p className="text-sm text-gray-600">Cotiza vidrios rápidamente</p>
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN MÓVIL POR TABS */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 p-3 text-center transition-colors ${
              activeTab === 'calc'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calculator size={18} />
              <span className="font-medium">Calcular</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('filter')}
            className={`flex-1 p-3 text-center transition-colors ${
              activeTab === 'filter'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Search size={18} />
              <span className="font-medium">Info</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex-1 p-3 text-center transition-colors relative ${
              activeTab === 'cart'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart size={18} />
              <span className="font-medium">Carrito</span>
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="lg:flex lg:h-[calc(100vh-140px)]">
        
        {/* COLUMNA IZQUIERDA: Calculadora */}
        <div className="flex-1 overflow-hidden">
          
          {/* CONTENIDO DESKTOP - Siempre visible */}
          <div className="hidden lg:block h-full overflow-y-auto px-4 pt-4 pb-4">
            <div className="max-w-4xl mx-auto space-y-4">
              
              {/* PANEL COMBINADO: Medidas + Filtros */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  
                  {/* Lado izquierdo: Medidas */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calculator size={18} className="text-blue-500" />
                      Medidas del vidrio
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Ancho (cm)
                        </label>
                        <input
                          type="number"
                          value={dimensions.ancho || ''}
                          onChange={(e) => setDimensions(prev => ({ ...prev, ancho: Number(e.target.value) }))}
                          className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Alto (cm)
                        </label>
                        <input
                          type="number"
                          value={dimensions.alto || ''}
                          onChange={(e) => setDimensions(prev => ({ ...prev, alto: Number(e.target.value) }))}
                          className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="150"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                        />
                      </div>
                    </div>
                    {/* Área calculada */}
                    {dimensions.ancho > 0 && dimensions.alto > 0 && (
                      <div className="mt-3 text-center text-sm bg-blue-50 p-2 rounded-lg border border-blue-200">
                        <span className="text-blue-600 font-medium">
                          📐 {calculateAreaFt2(dimensions.ancho, dimensions.alto).toFixed(2)} ft²
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Lado derecho: Botón para ver precios */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="text-4xl mb-2">💰</div>
                        <p className="text-gray-600 text-sm">
                          Complete las medidas y vea todos los<br />
                          precios disponibles para esas dimensiones
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowPricesModal(true);
                          fetchAllGlasses();
                        }}
                        disabled={!dimensions.ancho || !dimensions.alto || !quantity}
                        className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                          dimensions.ancho && dimensions.alto && quantity > 0
                            ? 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105 shadow-lg'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        🔍 Ver precios disponibles
                      </button>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* CONTENIDO MÓVIL - Por tabs */}
          <div className="lg:hidden">
            {/* Tab: Calcular */}
            {activeTab === 'calc' && (
              <div className="p-4 space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                    <Calculator size={16} className="text-blue-500" />
                    Medidas del vidrio
                  </h3>
                  <div className="space-y-3">
                    {/* Ancho y Alto en dos columnas */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          📏 Ancho (cm)
                        </label>
                        <input
                          type="number"
                          value={dimensions.ancho || ''}
                          onChange={(e) => setDimensions(prev => ({ ...prev, ancho: Number(e.target.value) }))}
                          className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          📐 Alto (cm)
                        </label>
                        <input
                          type="number"
                          value={dimensions.alto || ''}
                          onChange={(e) => setDimensions(prev => ({ ...prev, alto: Number(e.target.value) }))}
                          className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                          placeholder="150"
                        />
                      </div>
                    </div>
                    
                    {/* Cantidad y Área en dos columnas */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          🔢 Cantidad
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                        />
                      </div>
                      {dimensions.ancho > 0 && dimensions.alto > 0 && (
                        <div className="flex flex-col justify-end">
                          <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-center h-full flex flex-col justify-center">
                            <div className="text-xs text-blue-600 font-medium">Área total:</div>
                            <div className="text-base font-bold text-blue-800">
                              {calculateAreaFt2(dimensions.ancho, dimensions.alto).toFixed(2)} ft²
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botón para ver precios en móvil */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-center">
                    <div className="text-4xl mb-3">💰</div>
                    <p className="text-gray-600 text-sm mb-4">
                      Complete las medidas para ver todos los precios disponibles
                    </p>
                    <button
                      onClick={() => {
                        setShowPricesModal(true);
                        fetchAllGlasses();
                      }}
                      disabled={!dimensions.ancho || !dimensions.alto || !quantity}
                      className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                        dimensions.ancho && dimensions.alto && quantity > 0
                          ? 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105 shadow-lg'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      🔍 Ver precios disponibles
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Información */}
            {activeTab === 'filter' && (
              <div className="p-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Search size={18} className="text-blue-500" />
                    ¿Cómo funciona?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium text-gray-700">Ingresa las medidas</h4>
                        <p className="text-sm text-gray-600">Coloca el ancho, alto y cantidad del vidrio que necesitas</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium text-gray-700">Ve todos los precios</h4>
                        <p className="text-sm text-gray-600">El sistema te mostrará TODOS los vidrios disponibles organizados por categoría</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium text-gray-700">Selecciona y agrega</h4>
                        <p className="text-sm text-gray-600">Elige el vidrio que mejor se adapte a tu presupuesto y necesidades</p>
                      </div>
                    </div>

                    <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">📊 Categorías disponibles:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span>🪟</span>
                          <span className="text-blue-700">Plano</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🏰</span>
                          <span className="text-blue-700">Catedral</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🔥</span>
                          <span className="text-blue-700">Templado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>✨</span>
                          <span className="text-blue-700">Espejo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🕶️</span>
                          <span className="text-blue-700">Polarizado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🔮</span>
                          <span className="text-blue-700">Reflejante</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Carrito */}
            {activeTab === 'cart' && (
              <div className="p-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <Package size={18} className="text-green-500" />
                      Tu selección ({items.length} items)
                    </h3>
                  </div>

                  <div className="p-4">
                    {items.length > 0 ? (
                      <div className="space-y-3 mb-6">
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

                    {items.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-4 p-3 bg-green-50 rounded-lg">
                          <span className="text-lg font-bold">Total:</span>
                          <span className="text-xl font-bold text-green-600">S/ {totalCart.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <button 
                            onClick={handleSendToQuote}
                            disabled={isSendingToQuote}
                            className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-200 text-sm ${
                              isSendingToQuote 
                                ? 'bg-green-300 cursor-not-allowed text-white' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            {isSendingToQuote ? '🔄 Enviando...' : `🚀 Enviar a Cotización (${items.length})`}
                          </button>
                          
                          <button 
                            onClick={() => setItems([])}
                            className="w-full bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2 px-4 rounded-lg transition-all duration-200"
                          >
                            🗑️ Vaciar carrito
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Carrito Desktop Inteligente */}
        <div className={`hidden lg:flex transition-all duration-300 bg-white border-l border-gray-200 flex-col ${
          items.length === 0 ? 'w-16' : 'w-80'
        }`}>
          
          {items.length === 0 ? (
            // Vista colapsada
            <div className="p-4 text-center h-full flex flex-col items-center justify-center">
              <Package size={32} className="text-gray-300 mb-2" />
              <div className="text-xs text-gray-400 [writing-mode:vertical-rl] text-orientation-mixed transform rotate-90">
                Carrito vacío
              </div>
            </div>
          ) : (
            // Vista completa
            <>
              {/* Header del carrito */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Package className="text-green-500" size={24} />
                  <h2 className="text-lg font-bold text-gray-800">Tu selección</h2>
                  <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full">
                    {items.length}
                  </span>
                </div>
              </div>

              {/* Contenido del carrito */}
              <div className="flex-1 overflow-y-auto p-4">
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
              </div>

              {/* Footer del carrito */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-xl font-bold text-green-600">S/ {totalCart.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={handleSendToQuote}
                    disabled={isSendingToQuote}
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm ${
                      isSendingToQuote 
                        ? 'bg-green-300 cursor-not-allowed text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isSendingToQuote ? '🔄 Enviando...' : `🚀 Enviar a Cotización`}
                  </button>
                  
                  <button 
                    onClick={() => setItems([])}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2 px-4 rounded-xl transition-all duration-200"
                  >
                    🗑️ Vaciar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL DE PRECIOS */}
      {showPricesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden">
            {/* Header minimalista */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💰</span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Precios disponibles</h2>
                    <p className="text-xs text-gray-500">
                      {dimensions.ancho}×{dimensions.alto}cm • {quantity}pz • {calculateAreaFt2(dimensions.ancho, dimensions.alto).toFixed(2)}ft²
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPricesModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Pestañas minimalistas */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex overflow-x-auto">
                {glassCategories.map(category => {
                  const categoryGlasses = getGlassesByFamily(category.id);
                  const hasGlasses = categoryGlasses.length > 0;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveGlassTab(category.id)}
                      disabled={!hasGlasses}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        activeGlassTab === category.id
                          ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                          : hasGlasses
                          ? 'text-gray-600 hover:text-blue-500'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-sm">{category.icon}</span>
                      <span>{category.name}</span>
                      {hasGlasses && (
                        <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded">
                          {categoryGlasses.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-3 max-h-[75vh] overflow-y-auto">
              {loadingGlasses ? (
                <div className="text-center py-8">
                  <div className="text-2xl mb-2">⏳</div>
                  <p className="text-sm text-gray-600">Cargando...</p>
                </div>
              ) : (
                <>
                  {getGlassesByFamily(activeGlassTab).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {getGlassesByFamily(activeGlassTab).map(glass => {
                        const unitPrice = calculateUnitPrice(glass.unitPrice, dimensions);
                        const totalPrice = calculateTotalPrice(glass.unitPrice, dimensions, quantity);
                        const isProcessing = processingGlassId === glass.id;
                        const isDisabled = processingGlassId !== null && !isProcessing;
                        
                        return (
                          <div 
                            key={glass.id} 
                            className={`border rounded-md p-3 transition-all cursor-pointer relative ${
                              isProcessing 
                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                : isDisabled
                                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                            }`}
                            onClick={() => !isDisabled && handleSelectGlass(glass)}
                          >
                            {/* Loading overlay */}
                            {isProcessing && (
                              <div className="absolute inset-0 bg-blue-50 bg-opacity-80 rounded-md flex items-center justify-center z-10">
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                  <span className="text-xs text-blue-600 font-medium">
                                    {needsAdditionalSpecs(glass) ? 'Cargando opciones...' : 'Agregando...'}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="mb-3">
                              <h3 className="font-medium text-gray-800 text-sm leading-tight overflow-hidden" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>{glass.commercialName}</h3>
                              <p className="text-xs text-gray-500 mt-1">{glass.thicknessMM}mm • {glass.colorType || 'Estándar'}</p>
                            </div>
                            
                            <div className="text-center border-t border-gray-100 pt-2">
                              <div className="text-xs text-gray-500 mb-1">S/ {unitPrice.toFixed(2)} c/u</div>
                              <div className="font-bold text-green-600 text-base">S/ {totalPrice.toFixed(2)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-2xl mb-2">😕</div>
                      <p className="text-sm text-gray-500">No hay vidrios disponibles</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer minimalista */}
            <div className="border-t border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Ordenados por precio ↗️
                </div>
                <button
                  onClick={() => setShowPricesModal(false)}
                  className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ESPECIFICACIONES ADICIONALES */}
      {showSpecsModal && selectedGlass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Header */}
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-800">Especificaciones adicionales</h3>
              <p className="text-sm text-gray-600">{selectedGlass.commercialName}</p>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-4">
              {/* Loading state */}
              {loadingSpecs && (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Cargando opciones disponibles...</p>
                </div>
              )}

              {/* Contenido principal - solo visible cuando no está cargando */}
              {!loadingSpecs && (
                <>
                  {/* Selección de color */}
                  {(selectedGlass.colorType === 'COLOR' || selectedGlass.colorType === 'POLARIZADO' || selectedGlass.colorType === 'REFLEJANTE') && availableColors.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🎨 Selecciona el color específico:
                      </label>
                      <select 
                        value={selectedColorId}
                        onChange={(e) => setSelectedColorId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecciona un color</option>
                        {availableColors.map((color: {id: number, name: string}) => (
                          <option key={color.id} value={color.id.toString()}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Selección de textura */}
                  {selectedGlass.family === 'CATEDRAL' && availableTextures.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🏰 Selecciona la textura:
                      </label>
                      <select 
                        value={selectedTextureId}
                        onChange={(e) => setSelectedTextureId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecciona una textura</option>
                        {availableTextures.map((texture: {id: number, name: string}) => (
                          <option key={texture.id} value={texture.id.toString()}>
                            {texture.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Información de precio */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-blue-800 mb-1">💰 Precio calculado:</div>
                    <div className="text-lg font-bold text-blue-900">
                      S/ {calculateTotalPrice(selectedGlass.unitPrice, dimensions, quantity).toFixed(2)}
                    </div>
                    <div className="text-xs text-blue-600">
                      {calculateAreaFt2(dimensions.ancho, dimensions.alto).toFixed(2)} ft² × S/ {selectedGlass.unitPrice.toFixed(2)} × {quantity}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-4 py-3 flex justify-between">
              <button
                onClick={() => setShowSpecsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmWithSpecs}
                disabled={
                  (selectedGlass.colorType === 'COLOR' || selectedGlass.colorType === 'POLARIZADO' || selectedGlass.colorType === 'REFLEJANTE') && availableColors.length > 0 && !selectedColorId ||
                  selectedGlass.family === 'CATEDRAL' && availableTextures.length > 0 && !selectedTextureId
                }
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  ((selectedGlass.colorType === 'COLOR' || selectedGlass.colorType === 'POLARIZADO' || selectedGlass.colorType === 'REFLEJANTE') && availableColors.length > 0 && !selectedColorId) ||
                  (selectedGlass.family === 'CATEDRAL' && availableTextures.length > 0 && !selectedTextureId)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
