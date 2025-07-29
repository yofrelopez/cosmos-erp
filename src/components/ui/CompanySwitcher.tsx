'use client';

import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useCompanyStore } from '@/lib/store/useCompanyStore';
import Link from 'next/link';

export default function CompanySwitcher() {
  const { company, companies, setCompany } = useCompanyStore();

  if (!company) return null; // por si aún no se ha seleccionado

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          className="mx-2 mb-4 flex w-[calc(100%-1rem)] items-center justify-between
                     rounded-lg border px-3 py-2 text-sm font-medium text-gray-700
                     hover:bg-gray-50"
        >
          <span className="truncate">{company.name}</span>
          <ChevronDown size={14} className="ml-2" />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Portal>
        <Dropdown.Content
          align="start"
          className="z-50 min-w-[180px] rounded-lg border bg-white p-1 shadow-lg"
        >
          {companies.map((c) => (
            <Dropdown.Item
              key={c.id}
              onSelect={() => setCompany(c)}
              className={`block cursor-pointer rounded px-3 py-2 text-sm
                          ${c.id === company.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {c.name}
            </Dropdown.Item>
          ))}

          <Dropdown.Separator className="my-1 h-px bg-gray-200" />

          <Link
            href="/select-company"
            className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            + Añadir / gestionar
          </Link>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
