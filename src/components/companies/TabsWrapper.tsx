'use client';

import { useState } from 'react';
import type { Company } from '@prisma/client';
import { Building2, CreditCard, Phone, Share2, Smartphone } from 'lucide-react';

import GeneralTab from './tabs/GeneralTab';
import BankAccountsTab from './tabs/BankAccountsTab';
import ContactTab from './tabs/ContactTab';
import SocialTab from './tabs/SocialTab';
import WalletsTab from './tabs/WalletsTab';

interface Props {
  company: Company;
}

const tabs = [
  { key: 'general', label: 'General', icon: Building2, description: 'Información básica de la empresa' },
  { key: 'bank', label: 'Cuentas Bancarias', icon: CreditCard, description: 'Gestión de cuentas bancarias' },
  { key: 'wallets', label: 'Billeteras Digitales', icon: Smartphone, description: 'Gestión de billeteras digitales' },
  { key: 'contact', label: 'Contacto', icon: Phone, description: 'Información de contacto' },
  { key: 'social', label: 'Redes Sociales', icon: Share2, description: 'Enlaces a redes sociales' },
];

export default function TabsWrapper({ company }: Props) {
  const [activeTab, setActiveTab] = useState('general');

  // 👇 Estado fuente en cliente con la empresa actual (evita ver datos viejos al cambiar de tab)
  const [currentCompany, setCurrentCompany] = useState<Company>(company);

  console.log('Renderizando tab General con logoUrl =', currentCompany.logoUrl);


  return (
    <div className="space-y-0">
      {/* Header con navegación de tabs moderna */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Configuración de Empresa
              </h2>
              <p className="text-sm text-gray-600">
                Gestiona la información y configuración de {currentCompany.name}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación de tabs moderna */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                    : 'text-gray-600 hover:bg-white/60 hover:text-blue-600'
                }`}
                title={tab.description}
              >
                <Icon size={18} className={`transition-colors ${
                  activeTab === tab.key ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                }`} />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido del tab activo */}
      <div className="p-6">
       
        
        {activeTab === 'general' && (
          
          <GeneralTab
            company={currentCompany}
            onUpdated={setCurrentCompany}   // 👈 clave para refrescar tras guardar
          />
        )}
        {activeTab === 'bank' && <BankAccountsTab companyId={currentCompany.id} />}
        {activeTab === 'wallets' && <WalletsTab companyId={currentCompany.id} />}
        {activeTab === 'contact' && <ContactTab company={currentCompany} />}
        {activeTab === 'social' && <SocialTab company={currentCompany} />}
      </div>
    </div>
  );
}
