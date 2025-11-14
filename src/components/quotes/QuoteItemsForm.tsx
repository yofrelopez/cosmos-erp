'use client';

import { QuoteItem } from '@prisma/client';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Trash2, ImageIcon, X } from 'lucide-react';
import { QuoteItemForm } from '@/types';
import { toast } from 'sonner';
import ItemImages from './ItemImages';
import PendingItemImages from './PendingItemImages';

const unidadesSugeridas = [
  'unidad',
  'metro',
  'metro cuadrado',
  'metro cúbico',
  'pieza',
  'paquete',
  'docena',
  'kilogramo',
  'litro',
  'rollo',
  'juego',
];



interface QuoteItemsFormProps {
  defaultValues?: {
    id?: number;
    clientId?: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    notes: string;
    items: QuoteItemForm[];
  };
  isEditMode?: boolean;
}

export interface QuoteItemsFormHandle {
  uploadPendingImages: (quoteItems: { id: number }[]) => Promise<void>;
}




interface QuoteItemImage {
  id: number
  imageUrl: string
  fileName: string
  fileSize?: number
  createdAt: string
}

const QuoteItemsForm = forwardRef<QuoteItemsFormHandle, QuoteItemsFormProps>(({ defaultValues, isEditMode = false }, ref) => {
  const { register, control, watch, setValue, getValues } = useFormContext();
  const [itemImages, setItemImages] = useState<{ [key: number]: QuoteItemImage[] }>({});
  const [pendingImages, setPendingImages] = useState<{ [key: number]: File[] }>({});
  const [showImagesForItem, setShowImagesForItem] = useState<{ [key: number]: boolean }>({});
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items') || [];

  // No forzar item vacío automáticamente - el usuario debe agregar manualmente

  const handleAddItem = () => {
    append({ description: '', quantity: 1, unit: '', unitPrice: 0 });
  };

  const total = watchedItems.reduce((sum: number, item: QuoteItem) => {
    const subtotal = item.quantity * item.unitPrice;
    return sum + (isNaN(subtotal) ? 0 : subtotal);
  }, 0);

  // Cargar imágenes en modo edición
  useEffect(() => {
    if (!isEditMode || !defaultValues?.items) return;
    
    const loadImages = async () => {
      const imagesData: { [key: number]: QuoteItemImage[] } = {};
      
      for (const item of defaultValues.items) {
        if (item.id) {
          try {
            const response = await fetch(`/api/quote-items/${item.id}/images`);
            if (response.ok) {
              const data = await response.json();
              imagesData[item.id] = data.images || [];
            }
          } catch (error) {
            console.error(`Error cargando imágenes para item ${item.id}:`, error);
            imagesData[item.id] = [];
          }
        }
      }
      
      setItemImages(imagesData);
    };

    loadImages();
  }, [isEditMode, defaultValues?.items]);

  const handleImagesChange = async (itemId: number) => {
    try {
      const response = await fetch(`/api/quote-items/${itemId}/images`);
      if (response.ok) {
        const data = await response.json();
        setItemImages(prev => ({
          ...prev,
          [itemId]: data.images || []
        }));
      }
    } catch (error) {
      console.error(`Error actualizando imágenes para item ${itemId}:`, error);
    }
  };

  const handlePendingImagesChange = (itemIndex: number, images: File[]) => {
    setPendingImages(prev => ({
      ...prev,
      [itemIndex]: images
    }));
  };

  // Exponer función para subir imágenes pendientes (se usará después de crear la cotización)
  const uploadPendingImages = async (quoteItems: { id: number }[]) => {
    console.log('🖼️ Uploading pending images...');
    console.log('📋 Quote items received:', quoteItems);
    console.log('📋 Pending images:', Object.entries(pendingImages).map(([idx, files]) => ({ 
      itemIndex: idx, 
      filesCount: files.length 
    })));
    
    const promises: Promise<any>[] = [];
    
    Object.entries(pendingImages).forEach(([itemIndexStr, files]) => {
      const itemIndex = parseInt(itemIndexStr);
      
      // Verificar que el índice sea válido
      if (itemIndex < 0 || itemIndex >= quoteItems.length) {
        console.warn(`⚠️ Item index ${itemIndex} out of bounds. Available items: 0-${quoteItems.length - 1}`);
        return;
      }
      
      const quoteItem = quoteItems[itemIndex];
      console.log(`🔗 Mapping item index ${itemIndex} to quote item ID ${quoteItem?.id}`);
      
      if (quoteItem && files.length > 0) {
        files.forEach((file, fileIndex) => {
          console.log(`📤 Uploading file ${fileIndex + 1}/${files.length} to item ID ${quoteItem.id}`);
          
          const formData = new FormData();
          formData.append('image', file);
          
          const uploadPromise = fetch(`/api/quote-items/${quoteItem.id}/images`, {
            method: 'POST',
            body: formData
          }).then(response => {
            if (!response.ok) {
              console.error(`❌ Failed to upload image to item ${quoteItem.id}:`, response.status, response.statusText);
              throw new Error(`Upload failed for item ${quoteItem.id}`);
            }
            console.log(`✅ Image uploaded successfully to item ${quoteItem.id}`);
            return response.json();
          }).catch(error => {
            console.error(`❌ Error uploading image to item ${quoteItem.id}:`, error);
            throw error;
          });
          
          promises.push(uploadPromise);
        });
      }
    });

    if (promises.length > 0) {
      console.log(`🚀 Starting upload of ${promises.length} images...`);
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      console.log(`📊 Upload results: ${successful} successful, ${failed} failed`);
      
      if (failed > 0) {
        console.error('❌ Some images failed to upload:', results.filter(r => r.status === 'rejected'));
      }
      
      setPendingImages({}); // Limpiar imágenes pendientes
    } else {
      console.log('ℹ️ No images to upload');
    }
  };

  // Exponer funciones al componente padre
  useImperativeHandle(ref, () => ({
    uploadPendingImages
  }));

  // Obtener el estado inicial desde props o el contexto

 /* 👇 Solo copiar datos al formulario UNA vez */
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && isEditMode && defaultValues) {
      setValue('items',  defaultValues.items  ?? []);
      setValue('notes',  defaultValues.notes  ?? '');
      setValue('status', defaultValues.status ?? 'PENDING');
      initialized.current = true;             // evita nuevas ejecuciones
    }
  }, [defaultValues, isEditMode, setValue]);





  return (
    <div className="space-y-4 sm:space-y-6">

      {fields.map((field, index) => (
        <div key={field.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200">
          
          {/* MOBILE: Layout vertical con pares - DESKTOP: Layout horizontal */}
          <div className="space-y-4 lg:space-y-0 lg:flex lg:items-start lg:gap-4">
            
            {/* Descripción - Flex-grow en desktop para ocupar espacio disponible */}
            <div className="lg:flex-1 lg:min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                {...register(`items.${index}.description`)}
                disabled={isEditMode}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 sm:py-2 text-sm focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 resize-vertical"
                placeholder="Ej. Vidrio templado transparente 6mm con bordes pulidos y esquinas redondeadas"
                rows={3}
              />
              {isEditMode && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-amber-600">🔒</span>
                  <p className="text-xs text-amber-700 font-medium">Campo no editable</p>
                </div>
              )}
            </div>

            {/* MOBILE: Cantidad y Unidad en 2 columnas - DESKTOP: Flex con gap */}
            <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-4">
              
              {/* Cantidad */}
              <div className="lg:w-24">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                <input
                  type="number"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  disabled={isEditMode}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 sm:py-2 text-sm focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200"
                  min={1}
                />
                {isEditMode && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                    <span>🔒</span>
                    <span>No editable</span>
                  </div>
                )}
              </div>

              {/* Unidad de medida */}
              <div className="lg:w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">U. Medida</label>
                <select
                  {...register(`items.${index}.unit`)}
                  disabled={isEditMode}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 sm:py-2 text-sm bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200"
                >
                  <option value="">Seleccionar...</option>
                  {unidadesSugeridas.map((unidad) => (
                    <option key={unidad} value={unidad}>
                      {unidad}
                    </option>
                  ))}
                </select>
                {isEditMode && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                    <span>🔒</span>
                    <span>No editable</span>
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE: Precio y Subtotal en 2 columnas - DESKTOP: Flex con gap */}
            <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-4">
              
              {/* Precio unitario */}
              <div className="lg:w-28">
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                <input
                  type="number"
                  step="any"
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  disabled={isEditMode}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 sm:py-2 text-sm focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200"
                  min={0}
                  placeholder="0.00"
                />
                {isEditMode && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                    <span>🔒</span>
                    <span>No editable</span>
                  </div>
                )}
              </div>

              {/* Subtotal */}
              <div className="lg:w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtotal</label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-3 sm:py-2 flex items-center min-h-[52px] sm:min-h-[42px]">
                  <span className="text-sm lg:text-base font-bold text-blue-800 truncate">
                    S/. {(
                      (watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de imágenes - FUERA del flex principal, en su propia fila */}
          {isEditMode && field.id ? (
            // Modo edición: mostrar imágenes existentes si las hay
            itemImages[Number(field.id)] && itemImages[Number(field.id)].length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">Imágenes del item (solo lectura)</label>
                <ItemImages
                  quoteItemId={Number(field.id)}
                  images={itemImages[Number(field.id)] || []}
                  onImagesChange={() => handleImagesChange(Number(field.id!))}
                  readonly={true}
                />
              </div>
            )
          ) : !isEditMode && (
            // Modo creación: botón colapsable para mostrar sección de imágenes
            <div className="pt-4 border-t border-gray-200">
              {!showImagesForItem[index] ? (
                <button
                  type="button"
                  onClick={() => setShowImagesForItem(prev => ({ ...prev, [index]: true }))}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  Adjuntar imágenes (opcional)
                </button>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">Imágenes del item</label>
                    <button
                      type="button"
                      onClick={() => setShowImagesForItem(prev => ({ ...prev, [index]: false }))}
                      className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Ocultar
                    </button>
                  </div>
                  <PendingItemImages
                    itemIndex={index}
                    images={pendingImages[index] || []}
                    onImagesChange={handlePendingImagesChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* Botón eliminar - Centrado en móvil, derecha en desktop */}
          {!isEditMode && (
            <div className="flex justify-center lg:justify-end pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  toast('¿Eliminar este ítem?', {
                    description: 'Esta acción no se puede deshacer.',
                    action: {
                      label: 'Sí, eliminar',
                      onClick: () => {
                        remove(index);
                        toast.success('Ítem eliminado correctamente');
                      },
                    },
                  });
                }}
                className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-6 py-3 lg:px-4 lg:py-2 rounded-lg transition-all duration-200 font-medium min-h-[44px] sm:min-h-0 text-sm"
                title="Eliminar ítem"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                <span className="lg:hidden">Eliminar item</span>
                <span className="hidden lg:inline">Eliminar</span>
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Estado vacío o sección de botón agregar y total */}
      {fields.length === 0 ? (
        /* Estado vacío - Diseño centrado */
        <div className="text-center py-12 px-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              ¡Comienza tu cotización!
            </h3>
            <p className="text-gray-500 mb-6">
              Agrega items para crear una nueva cotización. Puedes incluir descripciones detalladas, cantidades, precios e imágenes.
            </p>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto"
            >
              <span className="text-xl">➕</span>
              Agregar primer ítem
            </button>
          </div>
        </div>
      ) : (
        /* Sección de botón agregar y total - Responsive */
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 mt-6 border-t-2 border-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
          
          {!isEditMode && (
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm border-l-4 border-orange-400 min-h-[48px] sm:min-h-0 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <span className="text-lg">➕</span>
              Agregar ítem
            </button>
          )}

          {/* Total destacado */}
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-xl px-6 py-5 w-full sm:w-auto shadow-sm">
            <div className="text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-end gap-2 mb-2">
                <span className="text-green-600">💰</span>
                <p className="text-sm text-green-700 font-semibold">Total de la cotización</p>
              </div>
              <p className="text-3xl font-bold text-green-800 tracking-tight">
                S/. {total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditMode && (
        <div className="space-y-6 pt-6">
          {/* Sección de observaciones */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              📝 Observaciones
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none"
              placeholder="Agrega observaciones, términos especiales, condiciones de entrega, etc..."
            />
          </div>

          {/* Sección de estado */}
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              🎯 Estado de la cotización
            </label>
            <select
              {...register('status')}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            >
              <option value="PENDING">🟡 Pendiente</option>
              <option value="ACCEPTED">🟢 Aprobada</option>
              <option value="REJECTED">🔴 Rechazada</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Cambia el estado según el progreso de la cotización
            </p>
          </div>
        </div>
      )}



    </div>
  );
});

QuoteItemsForm.displayName = 'QuoteItemsForm';

export default QuoteItemsForm;
