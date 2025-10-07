'use client';

import {
  Combobox,
  ComboboxPopover,
  ComboboxItem,
  useComboboxStore,
  useStoreState,
} from '@ariakit/react';
import * as Popover from '@radix-ui/react-popover';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import type { ClientLite } from '@/types';

interface Props {
  onSelect: (client: ClientLite) => void;
  onCreateNew: (query: string) => void;
}

export default function ClientAutocomplete({ onSelect, onCreateNew }: Props) {
  const combobox = useComboboxStore({});
  const rawSearch = useStoreState(combobox, 'value');
const search = rawSearch ?? '';



const { data: clients = [] } = usePaginatedList<ClientLite>({
  endpoint: '/api/clients',
  pageSize: 10,
  query: search.length >= 2 ? search : '',
});

  const hasSearch = search.trim().length >= 2;

  return (
    <Popover.Root>
      <Popover.Anchor asChild>
        <Combobox
          store={combobox}
          placeholder="Buscar cliente por nombre o documento..."
          className="w-full border-2 border-gray-200 px-4 py-4 sm:py-3 rounded-lg text-base sm:text-sm
                     focus:outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100 
                     transition-all duration-200 hover:border-blue-600 min-h-[48px] sm:min-h-0"
        />
      </Popover.Anchor>

      {hasSearch && (
        <ComboboxPopover
          store={combobox}
          className="z-50 mt-1 w-full bg-white border rounded-md shadow-md max-h-72 overflow-auto"
        >
          {clients.length === 0 && (
            <ComboboxItem
              store={combobox}
              value={`create-${search}`}
              onClick={() => {
                onCreateNew(search);
                combobox.hide();
              }}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 cursor-pointer"
            >
              + Nuevo cliente “{search}”
            </ComboboxItem>
          )}

          {clients.map((c: ClientLite) => (
            <ComboboxItem
              key={c.id}
              store={combobox}
              value={c.fullName || c.businessName || c.documentNumber}
              onClick={() => {
                onSelect(c);
                combobox.setValue(
                  c.fullName || c.businessName || c.documentNumber
                );
                combobox.hide();
              }}
              className="px-4 py-2 cursor-pointer aria-selected:bg-blue-100"
            >
              <span className="font-medium">
                {c.fullName || c.businessName}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {c.documentNumber}
              </span>
            </ComboboxItem>
          ))}
        </ComboboxPopover>
      )}
    </Popover.Root>
  );
}
