'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BankAccountSchema, bankAccountSchema } from '@/forms/company/bankSchema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Props {
  /** Valores iniciales; puede ser parcial cuando se crea */
  defaultValues: Partial<BankAccountSchema>;
  /** Acción que se ejecuta al enviar (crear o editar) */
  onSubmit: (data: BankAccountSchema) => Promise<void>;
  /** Muestra spinner y deshabilita botón guardar */
  loading?: boolean;
  /** Callback para cancelar (cerrar modal) */
  onCancel: () => void;
  /** Campos que deben mostrarse como `readOnly` (p. ej. currency en edición) */
  disabledFields?: (keyof BankAccountSchema)[];
}

export default function BankAccountForm({
  defaultValues,
  onSubmit,
  loading = false,
  onCancel,
  disabledFields = [],
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BankAccountSchema>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const isDisabled = (field: keyof BankAccountSchema) =>
    disabledFields.includes(field);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <Input
        label="Banco"
        {...register('bank')}
        error={errors.bank?.message}
        readOnly={isDisabled('bank')}
      />

      <Input
        label="Tipo de cuenta"
        {...register('accountType')}
        error={errors.accountType?.message}
        readOnly={isDisabled('accountType')}
      />

      <Input
        label="Número de cuenta"
        {...register('number')}
        error={errors.number?.message}
        readOnly={isDisabled('number')}
      />

      <Input
        label="CCI"
        {...register('cci')}
        error={errors.cci?.message}
        readOnly={isDisabled('cci')}
      />

      <Input
        label="Alias"
        {...register('alias')}
        error={errors.alias?.message}
        readOnly={isDisabled('alias')}
      />

      {/* Select de moneda */}
      <div>
        <label className="text-sm font-medium">Moneda</label>
        <select
          {...register('currency')}
          disabled={isDisabled('currency')}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="PEN">PEN (Soles)</option>
          <option value="USD">USD (Dólares)</option>
        </select>
        {errors.currency && (
          <p className="text-red-500 text-xs">{errors.currency.message}</p>
        )}
      </div>

      {/* Botones: ocupan las dos columnas */}
      <div className="col-span-full flex justify-end gap-2 pt-3">
        <Button action="cancel" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button action="save" loading={loading} type="submit">
          Guardar
        </Button>
      </div>
    </form>
  );
}
