'use client';

import { QuoteItem } from '@prisma/client';
import { useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { QuoteItemForm } from '@/types';

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


export default function QuoteItemsForm() {
  const { register, control, watch } = useFormContext();
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Ítems de la cotización</h2>

      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-wrap items-end gap-4 border-b pb-4">
          <div className="flex flex-col w-60">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <input
              {...register(`items.${index}.description`)}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. Vidrio templado"
            />
          </div>

          <div className="flex flex-col w-24">
            <label className="text-sm font-medium text-gray-700">Cantidad</label>
            <input
              type="number"
              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={1}
            />
          </div>

          <div className="flex flex-col w-40">
            <label className="text-sm font-medium text-gray-700">Unidad</label>
            <select
              {...register(`items.${index}.unit`)}
              className="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              {unidadesSugeridas.map((unidad) => (
                <option key={unidad} value={unidad}>
                  {unidad}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-32">
            <label className="text-sm font-medium text-gray-700">Precio unitario</label>
            <input
              type="number"
              {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={0}
            />
          </div>

          <div className="flex flex-col w-28">
            <label className="text-sm font-medium text-gray-700">Subtotal</label>
            <div className="text-sm text-gray-800 pt-2">
              S/. {(
                (watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0)
              ).toFixed(2)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-600 hover:text-red-800 cursor-pointer"
            title="Eliminar ítem"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}

      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={handleAddItem}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm cursor-pointer"
        >
          + Agregar ítem
        </button>
        <div className="text-lg font-semibold text-gray-800">
          Total: S/. {total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
