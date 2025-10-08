// src/lib/store/useCompanyStore.ts
import { Company } from '@prisma/client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyState {
  /* -------- estado principal -------- */
  company: Company | null;
  companies: Company[];

  /* -------- setters -------- */
  setCompany: (company: Company) => void;
  clearCompany: () => void;
  setCompanies: (list: Company[]) => void;

  /* -------- acciones CRUD -------- */
  addCompany: (c: Company) => void;
  updateCompany: (c: Company) => void;
  removeCompany: (id: number) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      /* -------- estado inicial -------- */
      company: null,
      companies: [],

      /* -------- setters -------- */
      setCompany:  (company)    => set({ company }),
      clearCompany: ()          => set({ company: null }),
      setCompanies: (companies) => set({ companies }),

      /* -------- acciones CRUD -------- */
      addCompany: (c) =>
        set((state) => ({ companies: [c, ...state.companies] })),

      updateCompany: (c) =>
        set((state) => ({
          companies: state.companies.map((x) => (x.id === c.id ? c : x)),
          company:   state.company?.id === c.id ? c : state.company,
        })),

      removeCompany: (id) =>
        set((state) => ({
          companies: state.companies.filter((x) => x.id !== id),
          company:   state.company?.id === id ? null : state.company,
        })),
    }),
    {
      name: 'selected-company',
      partialize: (state) => ({
        company: state.company, // Solo persiste la empresa seleccionada
        // companies: NO persistir la lista, siempre refrescar desde servidor
      }),
    }
  )
);
