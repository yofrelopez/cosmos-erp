'use client'

import React, { useState, useEffect } from 'react';
import { Calculator, Package, Frame, Ruler, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useMoldingFilters, useFilteredMoldings } from '@/hooks/useMoldingFilters';
import { useFrameGlasses } from '@/hooks/useFrameGlasses';
import { useFrameCalculator } from '@/hooks/useFrameCalculator';
import { useBackings } from '@/hooks/frames/useBackings';
import { useColors } from '@/hooks/frames/useColors';

interface Dimensions {
  ancho: number;
  alto: number;
}

// Tipos para las opciones de vidrio
type GlassOption = 'transparent' | 'matte' | 'none' | 'mirror';

// Tipo específico para selecciones de espejo
interface MirrorSelection {
  glassId: number;
  thickness: number;
  name: string;
  price: number;
}

interface FrameOption {
  id: string;
  molding: any;
  category: 'ESTÁNDAR' | 'PREMIUM' | 'BASTIDOR';
  glassOptions: {
    transparent: { glass: any; unitPrice: number; totalPrice: number } | null;
    matte: { glass: any; unitPrice: number; totalPrice: number } | null;
    none: { unitPrice: number; totalPrice: number };
    mirror: { glasses: MirrorSelection[]; defaultPrice: number } | null;
  };
}

// Función para redondear precios hacia arriba a .00 o .50
const roundPriceUp = (price: number): number => {
  const wholePart = Math.floor(price);
  const decimal = price - wholePart;
  
  if (decimal === 0) return price; // Ya está redondeado a .00
  if (decimal <= 0.5) return wholePart + 0.5; // Redondear a .50
  return wholePart + 1; // Redondear a .00 del siguiente entero
};

export default function FriendlyFrameCalculatorNew({ companyId }: { companyId: number }) {
  const router = useRouter();
  const { isCollapsed, isMobile } = useSidebar();
  
  // Estados principales
  const [dimensions, setDimensions] = useState<Dimensions>({ ancho: 0, alto: 0 });
  const [quantity, setQuantity] = useState(1);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'calc' | 'info'>('calc');
  const [activeModalTab, setActiveModalTab] = useState<'ESTÁNDAR' | 'PREMIUM' | 'BASTIDOR'>('ESTÁNDAR');
  
  // Estados para especificaciones
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<{frame: FrameOption; glassOption: GlassOption} | null>(null);
  const [selectedTexture, setSelectedTexture] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [processingFrameId, setProcessingFrameId] = useState<string | null>(null);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  
  // Estado para selección de vidrio por tarjeta
  const [glassSelections, setGlassSelections] = useState<Record<string, GlassOption>>({});
  
  // Estados para selecciones específicas de espejos
  const [mirrorSelections, setMirrorSelections] = useState<Record<string, MirrorSelection>>({});
  
  // Estado para travesaños (solo para BASTIDOR)
  const [crossbeamSelections, setCrossbeamSelections] = useState<Record<string, number>>({});
  
  // Estados para opciones de fondo
  const [backgroundOption, setBackgroundOption] = useState<'directo' | 'con-fondo'>('directo');
  const [backgroundType, setBackgroundType] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  
  // Estados del carrito
  const [items, setItems] = useState<any[]>([]);
  const [isSendingToQuote, setIsSendingToQuote] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Efecto para manejar cambios en tipos de fondo con restricciones
  useEffect(() => {
    if (backgroundOption === 'con-fondo') {
      const bgType = backgroundType.toLowerCase();
      
      if (['vidrio', 'nordex', 'cartón corrugado', 'cartulina'].includes(bgType)) {
        // Cambiar automáticamente selecciones incompatibles
        setGlassSelections(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(frameId => {
            if (bgType === 'vidrio') {
              // Para vidrio: desactivar 'none' y 'mirror'
              if (updated[frameId] === 'none' || updated[frameId] === 'mirror') {
                updated[frameId] = 'transparent';
              }
            } else if (bgType === 'nordex') {
              // Para nordex: solo desactivar 'none'
              if (updated[frameId] === 'none') {
                updated[frameId] = 'transparent';
              }
            } else if (['cartón corrugado', 'cartulina'].includes(bgType)) {
              // Para cartón corrugado y cartulina: desactivar 'none' y 'mirror'
              if (updated[frameId] === 'none' || updated[frameId] === 'mirror') {
                updated[frameId] = 'transparent';
              }
            }
          });
          return updated;
        });
        
        // Limpiar selecciones de espejos para vidrio, cartón corrugado y cartulina
        if (['vidrio', 'cartón corrugado', 'cartulina'].includes(bgType)) {
          setMirrorSelections({});
        }
      }
    }
  }, [backgroundOption, backgroundType]);

  // Efecto para cambiar pestaña automáticamente si BASTIDOR se desactiva
  useEffect(() => {
    if (backgroundOption === 'con-fondo' && (backgroundType.toLowerCase() === 'vidrio' || backgroundType.toLowerCase() === 'nordex') && activeModalTab === 'BASTIDOR') {
      // Si está en pestaña BASTIDOR y se selecciona fondo vidrio o nordex, cambiar a ESTÁNDAR
      setActiveModalTab('ESTÁNDAR');
    }
  }, [backgroundOption, backgroundType, activeModalTab]);

  // Efecto para limpiar color de fondo cuando se selecciona vidrio
  useEffect(() => {
    if (backgroundOption === 'con-fondo' && backgroundType.toLowerCase() === 'vidrio') {
      // Si se selecciona fondo vidrio, limpiar el color de fondo ya que no aplica
      setBackgroundColor('');
    }
  }, [backgroundOption, backgroundType]);

  // Hooks existentes
  const {
    filters: moldingFilters,
    options: moldingOptions,
    loading: moldingOptionsLoading,
    updateFilter: updateMoldingFilter,
    resetFilters: resetMoldingFilters
  } = useMoldingFilters(companyId);

  const { moldings, loading: moldingsLoading } = useFilteredMoldings(companyId, moldingFilters);
  const { glasses: frameGlasses, loading: glassLoading } = useFrameGlasses(companyId);
  const { backings, loading: backingsLoading } = useBackings(companyId);
  const { colors, loading: colorsLoading } = useColors(companyId);

  // Función para obtener todas las opciones de cuadros (una por moldura)
  const getAllFrameOptions = (): FrameOption[] => {
    console.log('🔍 Debug getAllFrameOptions:', {
      moldingsCount: moldings.length,
      frameGlassesCount: frameGlasses.length
    });
    
    if (!moldings.length || !frameGlasses.length) {
      console.log('❌ No hay molduras o vidrios disponibles');
      return [];
    }

    const options: FrameOption[] = [];
    
    // Filtrar vidrios y espejos
    const glass2mm = frameGlasses.filter(glass => glass.thickness === 2 && glass.category === 'VIDRIO');
    const transparentGlass = glass2mm.find(g => g.name.toLowerCase().includes('transparente')) || glass2mm[0];
    const matteGlass = glass2mm.find(g => g.name.toLowerCase().includes('mate'));
    
    // Obtener espejos (2mm y 3mm)
    const allMirrors = frameGlasses.filter(glass => glass.category === 'ESPEJO');
    const mirrorsByThickness = {
      2: allMirrors.filter(m => m.thickness === 2),
      3: allMirrors.filter(m => m.thickness === 3)
    };
    
    // Crear lista de espejos para selección
    const mirrorSelections: MirrorSelection[] = allMirrors.map(mirror => ({
      glassId: mirror.id,
      thickness: mirror.thickness,
      name: mirror.name.replace('✨ ', '').replace(/ \(\d+mm\)/, ''), // Limpiar nombre
      price: mirror.unitPrice
    }));

    moldings.forEach(molding => {
      const category = getCategoryByQuality(molding.quality);
      
      // Crear opciones de vidrio para esta moldura
      const glassOptions: FrameOption['glassOptions'] = {
        transparent: transparentGlass ? {
          glass: transparentGlass,
          ...calculatePrice(molding, transparentGlass)
        } : null,
        matte: matteGlass ? {
          glass: matteGlass,
          ...calculatePrice(molding, matteGlass)
        } : null,
        none: calculatePrice(molding, null),
        mirror: mirrorSelections.length > 0 ? {
          glasses: mirrorSelections,
          defaultPrice: mirrorSelections[0]?.price || 0
        } : null
      };

      options.push({
        id: `${category}-molding-${molding.id}`,
        molding,
        category,
        glassOptions
      });
    });

    console.log('✅ Opciones generadas:', options.length, options);
    return options.sort((a, b) => (a.glassOptions.transparent?.unitPrice || 0) - (b.glassOptions.transparent?.unitPrice || 0));
  };

  // Función para categorizar por calidad
  const getCategoryByQuality = (quality: string): 'ESTÁNDAR' | 'PREMIUM' | 'BASTIDOR' => {
    switch (quality.toLowerCase()) {
      case 'simple': return 'ESTÁNDAR';
      case 'fino': return 'PREMIUM';
      case 'bastidor': return 'BASTIDOR';
      default: return 'ESTÁNDAR';
    }
  };

  // Función para calcular precios
  const calculatePrice = (molding: any, glass: any | null, frameId?: string) => {
    if (!dimensions.ancho || !dimensions.alto) {
      return { unitPrice: 0, totalPrice: 0, moldingPrice: 0, glassPrice: 0, crossbeamPrice: 0, backgroundPrice: 0 };
    }

    // Obtener dimensiones finales considerando opción de fondo
    const finalDims = getFinalDimensions(dimensions.ancho, dimensions.alto);

    // Cálculo del perímetro para moldura (con dimensiones finales)
    const perimeterM = ((finalDims.ancho + finalDims.alto) * 2) / 100;
    const moldingPrice = perimeterM * molding.pricePerM;

    // Cálculo del área para vidrio (si aplica, con dimensiones finales)
    let glassPrice = 0;
    if (glass) {
      const areaFt2 = (finalDims.ancho * finalDims.alto) / 929.0304; // cm² a ft²
      glassPrice = areaFt2 * glass.unitPrice;
    }

    // Cálculo del precio de travesaños (solo para BASTIDOR, usa dimensiones originales)
    let crossbeamPrice = 0;
    if (frameId && molding.category === 'BASTIDOR') {
      const crossbeamCount = crossbeamSelections[frameId] || 0;
      if (crossbeamCount > 0) {
        // Los travesaños van en el lado más corto (usa dimensiones originales)
        const shortestSide = Math.min(dimensions.ancho, dimensions.alto);
        const crossbeamLengthM = shortestSide / 100; // convertir cm a metros
        
        // Precio de travesaño = longitud * precio por metro de la moldura * cantidad de travesaños
        crossbeamPrice = crossbeamLengthM * molding.pricePerM * crossbeamCount;
      }
    }

    // Cálculo del precio del fondo (si aplica)
    let backgroundPrice = 0;
    if (backgroundOption === 'con-fondo' && backgroundType) {
      // Buscar el fondo seleccionado en la lista de fondos
      const selectedBackground = backings.find(backing => backing.name === backgroundType);
      if (selectedBackground) {
        // Calcular área del fondo en ft² (usa dimensiones originales - el fondo cubre solo el área interior)
        const backgroundAreaFt2 = (dimensions.ancho * dimensions.alto) / 929.0304; // cm² a ft²
        backgroundPrice = backgroundAreaFt2 * selectedBackground.pricePerFt2;
      }
    }

    const unitPrice = roundPriceUp(moldingPrice + glassPrice + crossbeamPrice + backgroundPrice);
    const totalPrice = roundPriceUp(unitPrice * quantity);

    return { unitPrice, totalPrice, moldingPrice, glassPrice, crossbeamPrice, backgroundPrice };
  };

  // Función para manejar selección de marco
  const handleFrameSelection = (frame: FrameOption) => {
    console.log('🎯 handleFrameSelection called:', {
      frameId: frame.id,
      frameName: frame.molding.name,
      category: frame.category,
      glassSelections
    });
    
    const selectedGlass = glassSelections[frame.id] || 'transparent';
    
    // Validar selección de espejo si es necesario
    if (selectedGlass === 'mirror' && !mirrorSelections[frame.id]) {
      alert('Por favor selecciona un tipo de espejo específico');
      return;
    }
    
    setProcessingFrameId(frame.id);
    
    console.log('📋 Frame details:', {
      selectedGlass,
      category: frame.category,
      mirrorSelection: mirrorSelections[frame.id],
      shouldShowModal: frame.category === 'ESTÁNDAR' || frame.category === 'PREMIUM'
    });
    
    setTimeout(() => {
      // Si es Simple o Fino, mostrar modal de especificaciones
      if (frame.category === 'ESTÁNDAR' || frame.category === 'PREMIUM') {
        console.log('✅ Opening specs modal for category:', frame.category);
        setSelectedFrame({ frame, glassOption: selectedGlass });
        setShowSpecsModal(true);
        setShowOptionsModal(false);
      } else {
        console.log('🚀 Adding directly to cart for category:', frame.category);
        // Si es Bastidor, agregar directamente
        addToCartFromFrame(frame, selectedGlass, null, null);
      }
      setProcessingFrameId(null);
    }, 800);
  };

  // Función para agregar al carrito desde FrameOption
  const addToCartFromFrame = (frame: FrameOption, glassOption: GlassOption, texture: any = null, color: any = null) => {
    let glassInfo: any;
    let glassDescription: string;
    let selectedMirror: MirrorSelection | null = null;

    if (glassOption === 'mirror') {
      // Para espejos, usar la selección específica del usuario
      selectedMirror = mirrorSelections[frame.id];
      if (!selectedMirror) {
        alert('Por favor selecciona un tipo de espejo');
        return;
      }
      
      // Calcular precio con espejo específico
      const mirrorGlass = frameGlasses.find(g => g.id === selectedMirror!.glassId);
      if (!mirrorGlass) return;
      
      glassInfo = calculatePrice(frame.molding, mirrorGlass, frame.id);
      glassDescription = `${selectedMirror.name} ${selectedMirror.thickness}mm`;
    } else {
      // Para otros vidrios, recalcular con frameId para incluir travesaños
      const glass = glassOption === 'transparent' ? frameGlasses.find(g => g.category === 'VIDRIO' && g.name.toLowerCase().includes('simple') && g.thickness === 2) :
                   glassOption === 'matte' ? frameGlasses.find(g => g.category === 'VIDRIO' && g.name.toLowerCase().includes('mate') && g.thickness === 2) :
                   null;
      
      glassInfo = calculatePrice(frame.molding, glass, frame.id);
      if (!glassInfo) return;
      
      glassDescription = glassOption === 'none' 
        ? 'Sin vidrio'
        : glassOption === 'transparent'
        ? 'Vidrio 2mm transparente'
        : 'Vidrio 2mm mate';
    }

    let description = `Cuadro ${frame.molding.name}`;
    
    if (texture) description += ` - ${texture.name}`;
    if (color) description += ` - ${color.name}`;
    
    // Agregar información de travesaños si aplica
    const crossbeamCount = crossbeamSelections[frame.id] || 0;
    if (crossbeamCount > 0) {
      description += ` + ${crossbeamCount} travesaño${crossbeamCount > 1 ? 's' : ''}`;
    }
    
    // Agregar información de fondo si aplica
    if (backgroundOption === 'con-fondo') {
      description += ` + Con Fondo`;
      if (backgroundType) description += ` ${backgroundType}`;
      if (backgroundColor) description += ` ${backgroundColor}`;
    }
    
    // Mostrar dimensiones finales en la descripción
    const finalDims = getFinalDimensions(dimensions.ancho, dimensions.alto);
    if (backgroundOption === 'con-fondo') {
      description += ` + ${glassDescription} (${finalDims.ancho}×${finalDims.alto}cm - ${dimensions.ancho}×${dimensions.alto}cm base)`;
    } else {
      description += ` + ${glassDescription} (${dimensions.ancho}×${dimensions.alto}cm)`;
    }

    const newItem = {
      id: Date.now(),
      description,
      quantity,
      unitPrice: roundPriceUp(glassInfo.unitPrice),
      total: roundPriceUp(glassInfo.totalPrice),
      specifications: {
        dimensions: { ancho: dimensions.ancho, alto: dimensions.alto },
        finalDimensions: getFinalDimensions(dimensions.ancho, dimensions.alto),
        backgroundOption,
        backgroundType,
        backgroundColor,
        molding: frame.molding,
        glass: glassOption !== 'none' && 'glass' in glassInfo ? glassInfo.glass : selectedMirror ? frameGlasses.find(g => g.id === selectedMirror.glassId) : null,
        glassOption,
        mirror: selectedMirror,
        texture,
        color,
        crossbeams: crossbeamCount
      }
    };

    setItems(prev => [...prev, newItem]);
    
    // Limpiar estados
    setShowSpecsModal(false);
    setShowOptionsModal(false);
    setSelectedFrame(null);
    setSelectedTexture('');
    setSelectedColor('');
    setDimensions({ ancho: 0, alto: 0 });
    setQuantity(1);
    setGlassSelections({});
    setMirrorSelections({});

    // Ya no necesitamos alert - el carrito se actualiza visualmente
  };

  // Función para obtener las dimensiones finales (considerando opción de fondo)
  const getFinalDimensions = (ancho: number, alto: number) => {
    if (backgroundOption === 'con-fondo') {
      return {
        ancho: ancho + 10, // +5cm por cada lado
        alto: alto + 10    // +5cm por cada lado
      };
    }
    return { ancho, alto };
  };

  // Función para calcular área en ft² (con dimensiones finales)
  const calculateAreaFt2 = (ancho: number, alto: number) => {
    const finalDims = getFinalDimensions(ancho, alto);
    return (finalDims.ancho * finalDims.alto) / 929.0304;
  };

  // Función para calcular perímetro en metros (con dimensiones finales)
  const calculatePerimeterM = (ancho: number, alto: number) => {
    const finalDims = getFinalDimensions(ancho, alto);
    return ((finalDims.ancho + finalDims.alto) * 2) / 100;
  };

  // Función para enviar a cotización
  const handleSendToQuote = async () => {
    if (items.length === 0) {
      alert('No hay items en el carrito para enviar');
      return;
    }

    setIsSendingToQuote(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const quoteItems = items.map(item => ({
        description: item.description,
        unit: 'pieza',
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }));

      const existingItems = JSON.parse(localStorage.getItem('quoteItems') || '[]');
      const combinedItems = [...existingItems, ...quoteItems];
      localStorage.setItem('quoteItems', JSON.stringify(combinedItems));
      
      router.push('/admin/cotizaciones/nueva?from=calculator');
    } catch (error) {
      console.error('Error enviando a cotización:', error);
      alert('Error al enviar la cotización. Inténtalo nuevamente.');
    } finally {
      setIsSendingToQuote(false);
    }
  };

  const totalCart = roundPriceUp(items.reduce((sum, item) => sum + item.total, 0));
  const frameOptions = getAllFrameOptions();
  
  console.log('🎯 frameOptions actuales:', frameOptions.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil con tabs */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'calc'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calculator size={18} className="inline mr-2" />
            Calcular
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Información
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:flex lg:h-[calc(100vh-140px)]">
        
        {/* VERSIÓN DESKTOP */}
        <div className="hidden lg:block flex-1 h-full overflow-y-auto px-4 pt-4 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Frame size={20} className="text-purple-500" />
                Medidas del cuadro
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Ancho (cm)
                  </label>
                  <input
                    type="number"
                    value={dimensions.ancho || ''}
                    onChange={(e) => setDimensions(prev => ({ ...prev, ancho: Number(e.target.value) }))}
                    className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                    placeholder="30"
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
                    className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                    placeholder="40"
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
                    className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Área y Perímetro calculados */}
              {dimensions.ancho > 0 && dimensions.alto > 0 && (
                <div className="mt-3 text-center text-sm bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="flex justify-center items-center gap-6">
                    <div className="text-purple-600 font-medium">
                      📐 {calculateAreaFt2(dimensions.ancho, dimensions.alto).toFixed(2)} ft²
                      <div className="text-xs text-purple-500 mt-0.5">Área (vidrio)</div>
                    </div>
                    <div className="w-px h-8 bg-purple-200"></div>
                    <div className="text-purple-600 font-medium">
                      📏 {calculatePerimeterM(dimensions.ancho, dimensions.alto).toFixed(2)} m
                      <div className="text-xs text-purple-500 mt-0.5">Perímetro (moldura)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Apartado de Opciones de Fondo */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
              {/* Todo en una línea: 4 columnas */}
              <div className="grid grid-cols-4 gap-4 items-center">
                {/* Columna 1: Radio Directo */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="background-option"
                    value="directo"
                    checked={backgroundOption === 'directo'}
                    onChange={(e) => setBackgroundOption(e.target.value as 'directo' | 'con-fondo')}
                    className="w-4 h-4 text-purple-600 mr-2"
                  />
                  <span className="text-gray-700 font-medium">Directo</span>
                </label>
                
                {/* Columna 2: Radio Con Fondo */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="background-option"
                    value="con-fondo"
                    checked={backgroundOption === 'con-fondo'}
                    onChange={(e) => setBackgroundOption(e.target.value as 'directo' | 'con-fondo')}
                    className="w-4 h-4 text-purple-600 mr-2"
                  />
                  <span className="text-gray-700 font-medium">Con Fondo</span>
                </label>
                
                {/* Columna 3: Select Tipo */}
                <select
                  value={backgroundType}
                  onChange={(e) => setBackgroundType(e.target.value)}
                  disabled={backgroundOption === 'directo'}
                  className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 ${
                    backgroundOption === 'directo' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-900 border-gray-200'
                  }`}
                >
                  <option value="">Tipo de Fondo...</option>
                  {backingsLoading ? (
                    <option disabled>Cargando fondos...</option>
                  ) : (
                    backings.map((backing) => (
                      <option key={backing.id} value={backing.name}>
                        {backing.name}
                      </option>
                    ))
                  )}
                </select>
                
                {/* Columna 4: Select Color */}
                <select
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  disabled={backgroundOption === 'directo' || (backgroundOption === 'con-fondo' && backgroundType.toLowerCase() === 'vidrio')}
                  className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 ${
                    backgroundOption === 'directo' || (backgroundOption === 'con-fondo' && backgroundType.toLowerCase() === 'vidrio')
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-900 border-gray-200'
                  }`}
                >
                  <option value="">
                    {backgroundOption === 'con-fondo' && backgroundType.toLowerCase() === 'vidrio' 
                      ? 'Color no aplicable (Vidrio)' 
                      : 'Color de Fondo...'
                    }
                  </option>
                  {colorsLoading ? (
                    <option disabled>Cargando colores...</option>
                  ) : (
                    colors.map(color => (
                      <option key={color.id} value={color.name.toLowerCase()}>
                        {color.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            
            {/* Lado derecho: Botón para ver opciones */}
            <div className="flex items-center justify-center mt-6">
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-gray-600 text-sm">
                    Complete las medidas y vea todas las<br />
                    opciones de cuadros disponibles
                  </p>
                </div>
                  <button
                    onClick={() => {
                      console.log('🚀 Abriendo modal de opciones (móvil)');
                      setShowOptionsModal(true);
                    }}
                    disabled={!dimensions.ancho || !dimensions.alto || !quantity}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                    dimensions.ancho && dimensions.alto && quantity > 0
                      ? 'bg-purple-500 hover:bg-purple-600 transform hover:scale-105 shadow-lg'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  🔍 Ver opciones disponibles
                </button>
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
                  <Frame size={16} className="text-purple-500" />
                  Medidas del cuadro
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
                        className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                        placeholder="30"
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
                        className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                        placeholder="40"
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
                        className="w-full text-lg p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {dimensions.ancho > 0 && dimensions.alto > 0 && (
                      <div className="flex flex-col justify-end">
                        <div className="p-2 bg-purple-50 rounded-lg border border-purple-200 text-center h-full flex flex-col justify-center space-y-1">
                          <div className="text-[10px] text-purple-600 font-medium">Cálculos:</div>
                          <div className="text-xs font-bold text-purple-800">
                            📐 {calculateAreaFt2(dimensions.ancho, dimensions.alto).toFixed(2)} ft²
                          </div>
                          <div className="text-xs font-bold text-purple-800">
                            📏 {calculatePerimeterM(dimensions.ancho, dimensions.alto).toFixed(2)} m
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Apartado de Opciones de Fondo - Móvil */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                {/* Móvil: 2 filas para mejor legibilidad */}
                <div className="space-y-2">
                  {/* Primera fila: Radio buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="background-option-mobile"
                        value="directo"
                        checked={backgroundOption === 'directo'}
                        onChange={(e) => setBackgroundOption(e.target.value as 'directo' | 'con-fondo')}
                        className="w-4 h-4 text-purple-600 mr-2"
                      />
                      <span className="text-gray-700 text-sm">Directo</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="background-option-mobile"
                        value="con-fondo"
                        checked={backgroundOption === 'con-fondo'}
                        onChange={(e) => setBackgroundOption(e.target.value as 'directo' | 'con-fondo')}
                        className="w-4 h-4 text-purple-600 mr-2"
                      />
                      <span className="text-gray-700 text-sm">Con Fondo</span>
                    </label>
                  </div>
                  
                  {/* Segunda fila: Selects */}
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={backgroundType}
                      onChange={(e) => setBackgroundType(e.target.value)}
                      disabled={backgroundOption === 'directo'}
                      className={`w-full p-2 text-xs border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 ${
                        backgroundOption === 'directo' 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-900 border-gray-200'
                      }`}
                    >
                      <option value="">Tipo...</option>
                      {backingsLoading ? (
                        <option disabled>Cargando...</option>
                      ) : (
                        backings.map((backing) => (
                          <option key={backing.id} value={backing.name}>
                            {backing.name}
                          </option>
                        ))
                      )}
                    </select>
                    
                    <select
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      disabled={backgroundOption === 'directo'}
                      className={`w-full p-2 text-xs border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 ${
                        backgroundOption === 'directo' 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-900 border-gray-200'
                      }`}
                    >
                      <option value="">Color...</option>
                      <option value="blanco">Blanco</option>
                      <option value="negro">Negro</option>
                      <option value="crema">Crema</option>
                      <option value="gris">Gris</option>
                      <option value="beige">Beige</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botón para ver opciones en móvil */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="text-gray-600 text-sm mb-4">
                    Complete las medidas para ver todas las opciones de cuadros
                  </p>
                  <button
                    onClick={() => {
                      console.log('🚀 Abriendo modal de opciones');
                      setShowOptionsModal(true);
                    }}
                    disabled={!dimensions.ancho || !dimensions.alto || !quantity}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                      dimensions.ancho && dimensions.alto && quantity > 0
                        ? 'bg-purple-500 hover:bg-purple-600 transform hover:scale-105 shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    🔍 Ver opciones disponibles
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Información */}
          {activeTab === 'info' && (
            <div className="p-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Frame size={18} className="text-purple-500" />
                  ¿Cómo funciona?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium text-gray-700">Ingresa las medidas</h4>
                      <p className="text-sm text-gray-600">Coloca el ancho, alto y cantidad del cuadro que necesitas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium text-gray-700">Ve todas las opciones</h4>
                      <p className="text-sm text-gray-600">Explora marcos Estándar, Premium y Bastidor con diferentes opciones de vidrio</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium text-gray-700">Personaliza y agrega</h4>
                      <p className="text-sm text-gray-600">Selecciona texturas y colores, luego agrega al carrito</p>
                    </div>
                  </div>

                  <div className="mt-6 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">🎯 Categorías disponibles:</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span>🔲</span>
                        <span className="text-purple-700">Estándar (Simple)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🏆</span>
                        <span className="text-purple-700">Premium (Fino)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🖼️</span>
                        <span className="text-purple-700">Bastidor</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARRITO - Columna derecha en desktop */}
        <div className={`hidden lg:flex transition-all duration-300 bg-white border-l border-gray-200 flex-col ${
          items.length === 0 ? 'w-16' : 'w-80'
        }`}>
          
          {items.length === 0 ? (
            // Vista colapsada
            <div className="h-full flex flex-col items-center justify-center">
              <Package size={24} className="text-gray-300 mb-3" />
              <div className="text-xs text-gray-400 [writing-mode:vertical-rl] text-orientation-mixed">
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
                  {items.map((item, index) => (
                    <div key={`cart-item-${item.id}-${index}`} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="font-medium text-sm mb-2 text-gray-800">
                        {item.description}
                      </div>
                      
                      {/* Especificaciones detalladas */}
                      <div className="space-y-1 text-xs text-gray-600 mb-3">
                        <div>
                          🔲 <strong>Moldura:</strong> {item.specifications.molding.name}
                          {item.specifications.molding.quality && ` (${item.specifications.molding.quality})`}
                        </div>
                        
                        {item.specifications.texture && (
                          <div>
                            🎨 <strong>Textura:</strong> {item.specifications.texture.name}
                          </div>
                        )}
                        
                        {item.specifications.color && (
                          <div>
                            🌈 <strong>Color:</strong> {item.specifications.color.name}
                          </div>
                        )}
                        
                        {item.specifications.glass && (
                          <div>
                            🪟 <strong>Vidrio:</strong> {item.specifications.glass.category === 'VIDRIO' ? `Vidrio ${item.specifications.glass.name}` : item.specifications.glass.name}
                          </div>
                        )}
                        
                        <div>
                          📐 <strong>Dimensiones base:</strong> {item.specifications.dimensions.ancho} × {item.specifications.dimensions.alto} cm
                        </div>
                        
                        {item.specifications.backgroundOption === 'con-fondo' && (
                          <div>
                            📏 <strong>Dimensiones finales:</strong> {item.specifications.finalDimensions.ancho} × {item.specifications.finalDimensions.alto} cm
                          </div>
                        )}
                        
                        {item.specifications.backgroundOption === 'con-fondo' && (
                          <div>
                            🖼️ <strong>Fondo:</strong> {item.specifications.backgroundType} 
                            {item.specifications.backgroundColor && ` - ${item.specifications.backgroundColor}`}
                          </div>
                        )}
                        
                        {item.specifications.crossbeams > 0 && (
                          <div>
                            ➕ <strong>Travesaños:</strong> {item.specifications.crossbeams}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-500">Cantidad: {item.quantity}</div>
                          <div className="font-bold text-green-600 text-lg">S/ {roundPriceUp(item.total).toFixed(2)}</div>
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
              </div>
            </>
          )}

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
      </div>

      {/* BOTÓN FLOTANTE CARRITO MÓVIL */}
      {items.length > 0 && (
        <button
          onClick={() => setShowMobileCart(!showMobileCart)}
          className="lg:hidden fixed bottom-20 right-4 z-[60] bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full p-3 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-pulse"
          style={{
            bottom: 'max(80px, env(safe-area-inset-bottom) + 16px)'
          }}
        >
          <div className="flex items-center space-x-2">
            <Package size={20} />
            <span className="bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded-full">
              {items.length}
            </span>
          </div>
        </button>
      )}

      {/* MODAL DE OPCIONES DE CUADROS */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20 backdrop-blur-sm" onClick={() => setShowOptionsModal(false)}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-white">
                {/* Header del modal */}
                <div className="px-4 py-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">
                    {dimensions.ancho}×{dimensions.alto}cm
                  </h3>
                  <button
                    onClick={() => setShowOptionsModal(false)}
                    className="w-6 h-6 rounded-md bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Tabs del modal */}
                <div className="border-b border-gray-100">
                  <nav className="flex">
                    {['ESTÁNDAR', 'PREMIUM', 'BASTIDOR'].map((tab) => {
                      const isDisabled = tab === 'BASTIDOR' && backgroundOption === 'con-fondo' && (backgroundType.toLowerCase() === 'vidrio' || backgroundType.toLowerCase() === 'nordex');
                      
                      return (
                        <button
                          key={tab}
                          onClick={() => !isDisabled && setActiveModalTab(tab as any)}
                          disabled={isDisabled}
                          className={`flex-1 py-2 px-1 font-medium transition-colors ${
                            isDisabled
                              ? 'text-gray-300 cursor-not-allowed opacity-50'
                              : activeModalTab === tab
                              ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs">
                              {tab === 'ESTÁNDAR' && '🔲'} 
                              {tab === 'PREMIUM' && '🏆'} 
                              {tab === 'BASTIDOR' && '🖼️'} 
                            </span>
                            <span className="text-[9px] sm:text-xs leading-tight">{tab}</span>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Contenido de los tabs */}
                <div className="p-3 max-h-80 overflow-y-auto bg-white">
                  {frameOptions.filter(option => option.category === activeModalTab).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {frameOptions
                        .filter(option => option.category === activeModalTab)
                        .map((option, index) => {
                          const selectedGlass = glassSelections[option.id] || 'transparent';
                          
                          // Calcular precios desglosados
                          let moldingPrice = 0;
                          let glassPrice = 0;
                          let glassName = '';
                          
                          if (selectedGlass === 'mirror') {
                            const selectedMirror = mirrorSelections[option.id];
                            if (selectedMirror) {
                              const mirrorGlass = frameGlasses.find(g => g.id === selectedMirror.glassId);
                              if (mirrorGlass) {
                                const priceCalc = calculatePrice(option.molding, mirrorGlass, option.id);
                                moldingPrice = priceCalc.moldingPrice;
                                glassPrice = priceCalc.glassPrice;
                                // Crear nombre abreviado para previsualización
                                const abbrev = selectedMirror.name.toLowerCase().includes('chino') ? 'Esp.ch' :
                                              selectedMirror.name.toLowerCase().includes('americano') ? 'Esp.amr' :
                                              selectedMirror.name.toLowerCase().includes('colombiano') ? 'Esp.col' :
                                              selectedMirror.name.toLowerCase().includes('brasileño') ? 'Esp.bra' :
                                              selectedMirror.name.toLowerCase().includes('italiano') ? 'Esp.ita' :
                                              'Esp.' + selectedMirror.name.substring(0, 3).toLowerCase();
                                glassName = `${abbrev} ${selectedMirror.thickness}mm`;
                              }
                            } else if (option.glassOptions.mirror) {
                              const defaultMirror = option.glassOptions.mirror.glasses[0];
                              const mirrorGlass = frameGlasses.find(g => g.id === defaultMirror?.glassId);
                              if (mirrorGlass) {
                                const priceCalc = calculatePrice(option.molding, mirrorGlass, option.id);
                                moldingPrice = priceCalc.moldingPrice;
                                glassPrice = priceCalc.glassPrice;
                                // Crear nombre abreviado para previsualización
                                const abbrev = defaultMirror.name.toLowerCase().includes('chino') ? 'Esp.ch' :
                                              defaultMirror.name.toLowerCase().includes('americano') ? 'Esp.amr' :
                                              defaultMirror.name.toLowerCase().includes('colombiano') ? 'Esp.col' :
                                              defaultMirror.name.toLowerCase().includes('brasileño') ? 'Esp.bra' :
                                              defaultMirror.name.toLowerCase().includes('italiano') ? 'Esp.ita' :
                                              'Esp.' + defaultMirror.name.substring(0, 3).toLowerCase();
                                glassName = `${abbrev} ${defaultMirror.thickness}mm`;
                              }
                            }
                          } else {
                            const glassInfo = option.glassOptions[selectedGlass];
                            if (glassInfo && 'moldingPrice' in glassInfo && 'glassPrice' in glassInfo) {
                              moldingPrice = (glassInfo as any).moldingPrice;
                              glassPrice = (glassInfo as any).glassPrice;
                              glassName = selectedGlass === 'none' ? 'Sin vidrio' :
                                         selectedGlass === 'transparent' ? 'Simple' :
                                         selectedGlass === 'matte' ? 'Mate' : '';
                            } else if (glassInfo) {
                              // Para opciones que no tienen moldingPrice/glassPrice precalculados
                              const glass = selectedGlass === 'transparent' ? frameGlasses.find(g => g.category === 'VIDRIO' && g.name.toLowerCase().includes('simple') && g.thickness === 2) :
                                          selectedGlass === 'matte' ? frameGlasses.find(g => g.category === 'VIDRIO' && g.name.toLowerCase().includes('mate') && g.thickness === 2) :
                                          null;
                              const priceCalc = calculatePrice(option.molding, glass, option.id);
                              moldingPrice = priceCalc.moldingPrice;
                              glassPrice = priceCalc.glassPrice;
                              glassName = selectedGlass === 'none' ? 'Sin vidrio' :
                                         selectedGlass === 'transparent' ? 'Simple' :
                                         selectedGlass === 'matte' ? 'Mate' : '';
                            }
                          }
                          
                          // Calcular precio de travesaños si aplica
                          let crossbeamPrice = 0;
                          if (option.category === 'BASTIDOR') {
                            const crossbeamCount = crossbeamSelections[option.id] || 0;
                            if (crossbeamCount > 0) {
                              const shortestSide = Math.min(dimensions.ancho, dimensions.alto);
                              const crossbeamLengthM = shortestSide / 100;
                              crossbeamPrice = crossbeamLengthM * option.molding.pricePerM * crossbeamCount;
                            }
                          }
                          
                          // Calcular precio del fondo si aplica
                          let backgroundPrice = 0;
                          if (backgroundOption === 'con-fondo' && backgroundType) {
                            const selectedBackground = backings.find(backing => backing.name === backgroundType);
                            if (selectedBackground) {
                              const backgroundAreaFt2 = (dimensions.ancho * dimensions.alto) / 929.0304;
                              backgroundPrice = backgroundAreaFt2 * selectedBackground.pricePerFt2;
                            }
                          }
                          
                          const displayPrice = moldingPrice + glassPrice + crossbeamPrice + backgroundPrice;
                          
                          return (
                            <div
                              key={`${activeModalTab}-${option.id}-${index}`}
                              className={`relative p-3 rounded-lg border transition-all duration-200 ${
                                processingFrameId === option.id
                                  ? 'border-purple-300 bg-purple-50'
                                  : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-md'
                              }`}
                            >
                              {processingFrameId === option.id && (
                                <div className="absolute inset-0 bg-purple-100/90 rounded-lg flex items-center justify-center">
                                  <Loader2 className="animate-spin text-purple-600" size={16} />
                                </div>
                              )}
                              
                              {/* Nombre y desglose de precio */}
                              <div className="text-center mb-3">
                                <div className="text-sm font-medium text-gray-800 mb-2">
                                  {option.molding.name}
                                </div>
                                <div className="text-xs text-gray-600 mb-1">
                                  {glassName} S/ {roundPriceUp(glassPrice).toFixed(2)} + Moldura S/ {roundPriceUp(moldingPrice).toFixed(2)}
                                  {crossbeamPrice > 0 && ` + Trav. S/ ${roundPriceUp(crossbeamPrice).toFixed(2)}`}
                                  {backgroundPrice > 0 && ` + Fondo S/ ${roundPriceUp(backgroundPrice).toFixed(2)}`} = 
                                </div>
                                <div className="text-lg font-bold text-purple-600">
                                  S/ {roundPriceUp(displayPrice).toFixed(2)}
                                </div>
                              </div>

                              {/* Selector de vidrio compacto */}
                              <div className="mb-3">
                                {/* Debug info */}
                                {backgroundOption === 'con-fondo' && (
                                  <div className="text-xs text-center mb-2 p-1 bg-yellow-100 rounded">
                                    Debug: Fondo="{backgroundType}" | 
                                    Restricciones={
                                      backgroundType.toLowerCase() === 'vidrio' ? 'Sin vidrio + Espejo + BASTIDOR' :
                                      backgroundType.toLowerCase() === 'nordex' ? 'Sin vidrio + BASTIDOR' :
                                      ['cartón corrugado', 'cartulina'].includes(backgroundType.toLowerCase()) ? 'Sin vidrio + Espejo' :
                                      'Ninguna'
                                    }
                                  </div>
                                )}
                                <div className="flex justify-center space-x-3 mb-2">
                                  {option.glassOptions.transparent && (
                                    <label className="flex items-center cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`glass-${option.id}`}
                                        value="transparent"
                                        checked={selectedGlass === 'transparent'}
                                        onChange={(e) => setGlassSelections(prev => ({
                                          ...prev,
                                          [option.id]: e.target.value as GlassOption
                                        }))}
                                        className="w-3 h-3 text-purple-600 mr-1"
                                      />
                                      <span className="text-xs text-gray-600">Simple</span>
                                    </label>
                                  )}

                                  {option.glassOptions.matte && (
                                    <label className="flex items-center cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`glass-${option.id}`}
                                        value="matte"
                                        checked={selectedGlass === 'matte'}
                                        onChange={(e) => setGlassSelections(prev => ({
                                          ...prev,
                                          [option.id]: e.target.value as GlassOption
                                        }))}
                                        className="w-3 h-3 text-purple-600 mr-1"
                                      />
                                      <span className="text-xs text-gray-600">Mate</span>
                                    </label>
                                  )}

                                  {/* Opción "Sin vidrio" - deshabilitada si fondo es vidrio, nordex, cartón corrugado o cartulina */}
                                  <label className={`flex items-center ${
                                    backgroundOption === 'con-fondo' && ['vidrio', 'nordex', 'cartón corrugado', 'cartulina'].includes(backgroundType.toLowerCase())
                                      ? 'cursor-not-allowed opacity-50'
                                      : 'cursor-pointer'
                                  }`}>
                                    <input
                                      type="radio"
                                      name={`glass-${option.id}`}
                                      value="none"
                                      checked={selectedGlass === 'none'}
                                      disabled={backgroundOption === 'con-fondo' && ['vidrio', 'nordex', 'cartón corrugado', 'cartulina'].includes(backgroundType.toLowerCase())}
                                      onChange={(e) => setGlassSelections(prev => ({
                                        ...prev,
                                        [option.id]: e.target.value as GlassOption
                                      }))}
                                      className="w-3 h-3 text-purple-600 mr-1 disabled:text-gray-300"
                                    />
                                    <span className={`text-xs ${
                                      backgroundOption === 'con-fondo' && ['vidrio', 'nordex', 'cartón corrugado', 'cartulina'].includes(backgroundType.toLowerCase())
                                        ? 'text-gray-400 line-through'
                                        : 'text-gray-600'
                                    }`}>Sin vidrio</span>
                                  </label>

                                  {/* Opción "Espejo" - deshabilitada si fondo es vidrio, cartón corrugado o cartulina */}
                                  {option.glassOptions.mirror && (
                                    <label className={`flex items-center ${
                                      backgroundOption === 'con-fondo' && ['vidrio', 'cartón corrugado', 'cartulina'].includes(backgroundType.toLowerCase())
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'cursor-pointer'
                                    }`}>
                                      <input
                                        type="radio"
                                        name={`glass-${option.id}`}
                                        value="mirror"
                                        checked={selectedGlass === 'mirror'}
                                        disabled={backgroundOption === 'con-fondo' && ['vidrio', 'cartón corrugado', 'cartulina'].includes(backgroundType.toLowerCase())}
                                        onChange={(e) => setGlassSelections(prev => ({
                                          ...prev,
                                          [option.id]: e.target.value as GlassOption
                                        }))}
                                        className="w-3 h-3 text-purple-600 mr-1 disabled:text-gray-300"
                                      />
                                      <span className={`text-xs ${
                                        backgroundOption === 'con-fondo' && ['vidrio', 'cartón corrugado', 'cartulina'].includes(backgroundType.toLowerCase())
                                          ? 'text-gray-400 line-through'
                                          : 'text-gray-600'
                                      }`}>Espejo</span>
                                    </label>
                                  )}
                                </div>

                                {/* Subselector de espejos (expandible) */}
                                {selectedGlass === 'mirror' && option.glassOptions.mirror && (
                                  <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                    {/* Agrupar por grosor */}
                                    {[2, 3].map(thickness => {
                                      const mirrorsForThickness = option.glassOptions.mirror!.glasses.filter(m => m.thickness === thickness);
                                      
                                      if (mirrorsForThickness.length === 0) return null;
                                      
                                      return (
                                        <div key={thickness} className="mb-1 last:mb-0">
                                          <div className="flex items-center justify-center gap-2">
                                            <span className="text-xs font-medium text-slate-600">{thickness}mm:</span>
                                            <div className="flex gap-2">
                                              {mirrorsForThickness.map(mirror => {
                                                // Extraer solo el origen del nombre (Chino, Americano, etc.)
                                                const simpleName = mirror.name.toLowerCase().includes('chino') ? 'Chino' :
                                                                 mirror.name.toLowerCase().includes('americano') ? 'Americano' :
                                                                 mirror.name.toLowerCase().includes('colombiano') ? 'Colombiano' :
                                                                 mirror.name.toLowerCase().includes('brasileño') ? 'Brasileño' :
                                                                 mirror.name.toLowerCase().includes('italiano') ? 'Italiano' :
                                                                 mirror.name.split(' ')[0]; // Fallback: primera palabra
                                                
                                                return (
                                                  <label key={mirror.glassId} className="flex items-center cursor-pointer bg-white rounded px-2 py-1 text-xs border border-blue-200 hover:border-blue-300">
                                                    <input
                                                      type="radio"
                                                      name={`mirror-${option.id}`}
                                                      value={mirror.glassId}
                                                      checked={mirrorSelections[option.id]?.glassId === mirror.glassId}
                                                      onChange={() => setMirrorSelections(prev => ({
                                                        ...prev,
                                                        [option.id]: mirror
                                                      }))}
                                                      className="w-2.5 h-2.5 text-blue-600 mr-1"
                                                    />
                                                    <span className="text-gray-700">{simpleName}</span>
                                                  </label>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Selector de travesaños (solo para BASTIDOR) */}
                              {activeModalTab === 'BASTIDOR' && (
                                <div className="mb-3 p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                  <div className="text-center mb-2">
                                    <span className="text-xs font-medium text-amber-600">Travesaños:</span>
                                  </div>
                                  <div className="flex justify-center space-x-4">
                                    {[0, 1, 2].map(count => (
                                      <label key={count} className="flex items-center cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`crossbeam-${option.id}`}
                                          value={count}
                                          checked={(crossbeamSelections[option.id] || 0) === count}
                                          onChange={(e) => setCrossbeamSelections(prev => ({
                                            ...prev,
                                            [option.id]: parseInt(e.target.value)
                                          }))}
                                          className="w-3 h-3 text-amber-600 mr-1"
                                        />
                                        <span className="text-xs text-gray-700 font-medium">{count}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Botón compacto */}
                              <button
                                onClick={() => handleFrameSelection(option)}
                                className="w-full py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-colors"
                              >
                                Seleccionar
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <p className="text-sm">No hay opciones disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ESPECIFICACIONES (Texturas y Colores) */}
      {(() => {
        console.log('🔍 Modal render check:', {
          showSpecsModal,
          selectedFrame: selectedFrame ? 'exists' : 'null',
          shouldShow: showSpecsModal && selectedFrame ? 'YES' : 'NO',
          frameDetails: selectedFrame
        });
        return null;
      })()}
      {showSpecsModal && selectedFrame && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div 
            className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20" 
            onClick={() => setShowSpecsModal(false)}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
              {(() => {
                console.log('🎯 MODAL SPECS RENDERING!', selectedFrame);
                return null;
              })()}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Frame className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Especificaciones
                      </h3>
                      <p className="text-sm text-purple-600 font-medium">
                        {selectedFrame.frame.molding.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSpecsModal(false)}
                    className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                  <div className="space-y-6">
                    {/* Nota informativa */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Opcional:</strong> Puedes especificar textura y color, o agregar al carrito sin estas especificaciones.
                      </p>
                    </div>

                    {/* Selector de Textura */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800 mb-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs">T</span>
                        </div>
                        <span>Textura <span className="text-gray-500 font-normal">(opcional)</span></span>
                      </label>
                      <select
                        value={selectedTexture}
                        onChange={(e) => setSelectedTexture(e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all duration-200 bg-gradient-to-r from-white to-gray-50 hover:shadow-sm"
                      >
                        <option value="">-- Sin especificar --</option>
                        {moldingOptions.textures?.map((texture, textureIndex) => (
                          <option key={`texture-${texture.id}-${textureIndex}`} value={texture.id.toString()}>
                            {texture.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selector de Color */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800 mb-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs">C</span>
                        </div>
                        <span>Color <span className="text-gray-500 font-normal">(opcional)</span></span>
                      </label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all duration-200 bg-gradient-to-r from-white to-gray-50 hover:shadow-sm"
                      >
                        <option value="">-- Sin especificar --</option>
                        {moldingOptions.colors?.map((color, colorIndex) => (
                          <option key={`color-${color.id}-${colorIndex}`} value={color.id.toString()}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={() => setShowSpecsModal(false)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      ❌ Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const texture = moldingOptions.textures?.find(t => t.id.toString() === selectedTexture);
                        const color = moldingOptions.colors?.find(c => c.id.toString() === selectedColor);
                        
                        addToCartFromFrame(selectedFrame.frame, selectedFrame.glassOption, texture, color);
                      }}
                      className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    >
                      ✅ Agregar al carrito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* MODAL CARRITO MÓVIL */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-gradient-to-t from-purple-600/30 via-blue-600/20 to-transparent backdrop-blur-sm">
          <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md rounded-t-3xl border-t border-white/30 shadow-2xl max-h-[80vh] flex flex-col">
            
            {/* Header del carrito móvil */}
            <div className="p-4 border-b border-purple-100/50 bg-gradient-to-r from-purple-50/70 to-blue-50/70 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Package className="text-white" size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Tu Carrito</h3>
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => setShowMobileCart(false)}
                className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido del carrito móvil */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={`mobile-cart-${item.id}-${index}`} className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-sm">
                    <h4 className="font-medium text-gray-800 text-sm mb-3">{item.description}</h4>
                    
                    {/* Especificaciones detalladas */}
                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div>🔲 {item.specifications.molding.name}</div>
                      {item.specifications.texture && (
                        <div>🎨 {item.specifications.texture.name}</div>
                      )}
                      {item.specifications.color && (
                        <div>🌈 {item.specifications.color.name}</div>
                      )}
                      {item.specifications.glass && (
                        <div>🪟 {item.specifications.glass.category === 'VIDRIO' ? `Vidrio ${item.specifications.glass.name}` : item.specifications.glass.name}</div>
                      )}
                      <div>📐 {item.specifications.dimensions.ancho} × {item.specifications.dimensions.alto} cm</div>
                      {item.specifications.backgroundOption === 'con-fondo' && (
                        <div>📏 Final: {item.specifications.finalDimensions.ancho} × {item.specifications.finalDimensions.alto} cm</div>
                      )}
                      {item.specifications.backgroundOption === 'con-fondo' && (
                        <div>🖼️ {item.specifications.backgroundType}{item.specifications.backgroundColor && ` - ${item.specifications.backgroundColor}`}</div>
                      )}
                      {item.specifications.crossbeams > 0 && (
                        <div>➕ {item.specifications.crossbeams} travesaños</div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Cantidad: {item.quantity}</span>
                      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">S/ {roundPriceUp(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer con total y botón */}
            <div className="p-4 border-t border-purple-100/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 backdrop-blur-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total:</span>
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  S/ {roundPriceUp(items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)).toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={handleSendToQuote}
                disabled={isSendingToQuote}
                className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 ${
                  isSendingToQuote
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isSendingToQuote ? 'Enviando...' : '🚀 Enviar a Cotización'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}