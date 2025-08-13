'use client';

import { useState } from 'react';
import type { Company } from '@prisma/client';

import GeneralTab from './tabs/GeneralTab';
import BankAccountsTab from './tabs/BankAccountsTab';
import ContactTab from './tabs/ContactTab';
import SocialTab from './tabs/SocialTab';

interface Props {
  company: Company;
}

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'bank', label: 'Cuentas bancarias' },
  { key: 'contact', label: 'Contacto' },
  { key: 'social', label: 'Redes' },
];

export default function TabsWrapper({ company }: Props) {
  const [activeTab, setActiveTab] = useState('general');

  // 👇 Estado fuente en cliente con la empresa actual (evita ver datos viejos al cambiar de tab)
  const [currentCompany, setCurrentCompany] = useState<Company>(company);

  console.log('Renderizando tab General con logoUrl =', currentCompany.logoUrl);


  return (
    <div className="space-y-4">
      {/* Navegación de tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-md border-b-2 font-medium transition ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido del tab activo */}
      

      <div className="bg-white p-6 rounded-lg shadow">
       
        
        {activeTab === 'general' && (
          
          <GeneralTab
            company={currentCompany}
            onUpdated={setCurrentCompany}   // 👈 clave para refrescar tras guardar
          />
        )}
        {activeTab === 'bank' && <BankAccountsTab companyId={currentCompany.id} />}
        {activeTab === 'contact' && <ContactTab company={currentCompany} />}
        {activeTab === 'social' && <SocialTab company={currentCompany} />}
      </div>
    </div>
  );
}
