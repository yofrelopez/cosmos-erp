// src/lib/store/useCompanyStore.ts
import { Company } from '@prisma/client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyState {
  /* -------- estado existente -------- */
  company: Company | null;
  setCompany: (company: Company) => void;
  clearCompany: () => void;

  /* -------- NUEVO -------- */
  companies: Company[];                 // lista disponible en el dashboard
  setCompanies: (list: Company[]) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      /* -------- estado default -------- */
      company: null,
      companies: [],

      /* -------- setters -------- */
      setCompany:  (company)    => set({ company }),
      clearCompany: ()          => set({ company: null }),
      setCompanies: (companies) => set({ companies }),
    }),
    {
      name: 'selected-company',          // clave en localStorage
      partialize: (state) => ({
        company:   state.company,        // persiste la empresa activa
        companies: state.companies,      // y la lista (útil al recargar)
      }),
    },
  ),
);
