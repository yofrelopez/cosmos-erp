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
import { Loader2, Plus, Search } from 'lucide-react';

interface Props {
  onSelect: (client: ClientLite) => void;
  onCreateNew: (query: string) => void;
}

export default function ClientAutocomplete({ onSelect, onCreateNew }: Props) {
  const combobox = useComboboxStore({});
  const rawSearch = useStoreState(combobox, 'value');
  const search = rawSearch ?? '';

  const { data: clients = [], isLoading } = usePaginatedList<ClientLite>({
    endpoint: '/api/clients',
    pageSize: 15,
    query: search.length >= 1 ? search : '',
  });

  const hasSearch = search.trim().length >= 1;
  const shouldShowResults = hasSearch && search.trim().length >= 1;

  // Manejar Enter para crear nuevo cliente rápidamente
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hasSearch && !isLoading && clients.length === 0) {
      e.preventDefault();
      onCreateNew(search);
      combobox.hide();
    }
  };

  return (
    <Popover.Root>
      <Popover.Anchor asChild>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {isLoading && hasSearch ? (
              <Loader2 size={20} className="animate-spin text-blue-500" />
            ) : (
              <Search size={20} />
            )}
          </div>
          
          <Combobox
            store={combobox}
            placeholder="Buscar cliente por nombre o documento - Presiona Enter para crear nuevo"
            onKeyDown={handleKeyDown}
            className="w-full border-2 border-gray-200 pl-12 pr-4 py-4 sm:py-3 rounded-lg text-base sm:text-sm
                       focus:outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-100 
                       transition-all duration-200 hover:border-blue-600 min-h-[48px] sm:min-h-0"
          />
          
          {/* Indicador de estado */}
          {hasSearch && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {isLoading ? 'Buscando...' : `${clients.length} encontrados`}
            </div>
          )}
        </div>
      </Popover.Anchor>

      {hasSearch && (
        <ComboboxPopover
          store={combobox}
          className="z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto"
        >
          {/* Loading state */}
          {isLoading && (
            <div className="px-4 py-3 text-center text-gray-500">
              <Loader2 size={20} className="animate-spin mx-auto mb-2" />
              <span className="text-sm">Buscando clientes...</span>
            </div>
          )}

          {/* No results - Create new option */}
          {!isLoading && clients.length === 0 && (
            <div key="no-results-container" className="p-2">
              <ComboboxItem
                key="create-new-no-results"
                store={combobox}
                value={`create-${search}`}
                onClick={() => {
                  onCreateNew(search);
                  combobox.hide();
                }}
                className="flex items-center gap-3 px-4 py-3 text-blue-600 hover:bg-blue-50 cursor-pointer rounded-lg transition-colors duration-200 group"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Plus size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Crear nuevo cliente</div>
                  <div className="text-xs text-gray-500">
                    No se encontró "{search}" - Presiona Enter para crear
                  </div>
                </div>
              </ComboboxItem>
            </div>
          )}

          {/* Results */}
          {!isLoading && clients.length > 0 && (
            <div key="client-results-container" className="p-2">
              {/* Header */}
              <div className="px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-100 mb-1">
                {clients.length} {clients.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
              </div>

              {/* Client list */}
              {clients.map((c: ClientLite, index) => (
                <ComboboxItem
                  key={`client-${c.id}-${index}`}
                  store={combobox}
                  value={c.fullName || c.businessName || c.documentNumber}
                  onClick={() => {
                    onSelect(c);
                    // Mostrar el nombre más apropiado en el input
                    const displayName = c.fullName && c.businessName 
                      ? `${c.fullName} (${c.businessName})`
                      : c.fullName || c.businessName || c.documentNumber;
                    combobox.setValue(displayName);
                    combobox.hide();
                  }}
                  className="flex items-center gap-3 px-3 py-3 cursor-pointer aria-selected:bg-blue-50 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {(c.fullName || c.businessName || '').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {c.fullName && c.businessName ? (
                        <>
                          <span className="text-blue-600">👤</span> {c.fullName}
                          <span className="text-xs text-gray-400 mx-1">•</span>
                          <span className="text-purple-600">🏢</span> {c.businessName}
                        </>
                      ) : c.fullName ? (
                        <>
                          <span className="text-blue-600">👤</span> {c.fullName}
                        </>
                      ) : c.businessName ? (
                        <>
                          <span className="text-purple-600">🏢</span> {c.businessName}
                        </>
                      ) : (
                        c.documentNumber
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{c.documentNumber}</span>
                      {(c.fullName || c.businessName) && (
                        <span className="ml-2 text-gray-400">
                          • {c.fullName ? 'Persona' : 'Empresa'}
                        </span>
                      )}
                    </div>
                  </div>
                </ComboboxItem>
              ))}

              {/* Create option at bottom if there are results */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <ComboboxItem
                  key="create-new-with-results"
                  store={combobox}
                  value={`create-new-${search}`}
                  onClick={() => {
                    onCreateNew(search);
                    combobox.hide();
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors text-sm"
                >
                  <Plus size={14} />
                  <span>¿No encuentras el cliente? Crear nuevo</span>
                </ComboboxItem>
              </div>
            </div>
          )}
        </ComboboxPopover>
      )}
    </Popover.Root>
  );
}
