'use client';

import { QuoteItem } from '@prisma/client';
import { useEffect, useRef } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { QuoteItemForm } from '@/types';
import { toast } from 'sonner';

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




export default function QuoteItemsForm({ defaultValues, isEditMode = false }: QuoteItemsFormProps) {
  const { register, control, watch, setValue, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items') || [];

  useEffect(() => {
    if (watchedItems.length === 0) {
      append({ description: '', quantity: 1, unit: '', unitPrice: 0 });
    }
  }, [watchedItems.length, append]);

  const handleAddItem = () => {
    append({ description: '', quantity: 1, unit: '', unitPrice: 0 });
  };

  const total = watchedItems.reduce((sum: number, item: QuoteItem) => {
    const subtotal = item.quantity * item.unitPrice;
    return sum + (isNaN(subtotal) ? 0 : subtotal);
  }, 0);

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
        <div key={field.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          
          {/* MOBILE: Layout vertical con pares - DESKTOP: Layout horizontal */}
          <div className="space-y-4 lg:space-y-0 lg:flex lg:items-start lg:gap-4">
            
            {/* Descripción - Flex-grow en desktop para ocupar espacio disponible */}
            <div className="lg:flex-1 lg:min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <input
                {...register(`items.${index}.description`)}
                disabled={isEditMode}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 sm:py-2 text-sm focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200"
                placeholder="Ej. Vidrio templado transparente 6mm con bordes pulidos y esquinas redondeadas"
              />
              {isEditMode && <p className="text-xs text-gray-500 mt-1">Este campo no se puede editar.</p>}
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
                {isEditMode && <p className="text-xs text-gray-500 mt-1">Ineditable.</p>}
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
                {isEditMode && <p className="text-xs text-gray-500 mt-1">Ineditable.</p>}
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
                {isEditMode && <p className="text-xs text-gray-500 mt-1">Ineditable.</p>}
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

      {/* Sección de botón agregar y total - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t-2 border-gray-100">
        
        {!isEditMode && (
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 text-sm font-medium cursor-pointer transition-all duration-200 border-l-4 border-orange-500 min-h-[48px] sm:min-h-0 w-full sm:w-auto"
          >
            + Agregar ítem
          </button>
        )}

        {/* Total destacado */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl px-6 py-4 w-full sm:w-auto">
          <div className="text-center sm:text-right">
            <p className="text-sm text-green-700 font-medium mb-1">Total de la cotización</p>
            <p className="text-2xl font-bold text-green-800">
              S/. {total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {isEditMode  && (
        <div className="space-y-4 pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Agrega alguna nota adicional..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de la cotización
            </label>

            <select
              {...register('status')}
              className="w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PENDING">Pendiente</option>
              <option value="ACCEPTED">Aprobada</option>
              <option value="REJECTED">Rechazada</option>
            </select>
            
            
          </div>
        </div>
      )}



    </div>
  );
}
