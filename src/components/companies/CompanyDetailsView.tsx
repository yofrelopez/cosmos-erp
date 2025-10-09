'use client';

import { Company, BankAccount, Wallet } from '@prisma/client';
import { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Smartphone, 
  Edit2, 
  Globe,
  Hash,
  Calendar,
  User,
  MessageCircle,
  Facebook,
  Instagram,
  Music,
  UserCheck,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CompanyWithRelations extends Company {
  bankAccounts: BankAccount[];
  wallets: Wallet[];
}

interface Props {
  company: CompanyWithRelations;
}

type Tab = 'general' | 'bank' | 'wallets';

/**
 * Vista de detalles de empresa (solo lectura)
 */
export default function CompanyDetailsView({ company }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const tabs = [
    { id: 'general' as Tab, label: 'Información General', icon: Building2 },
    { id: 'bank' as Tab, label: 'Cuentas Bancarias', icon: CreditCard },
    { id: 'wallets' as Tab, label: 'Billeteras Digitales', icon: Smartphone },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header con información básica */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Logo de la empresa */}
            <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border-2 border-gray-200 shadow-sm">
              {company.logoUrl ? (
                <Image
                  src={company.logoUrl}
                  alt={`Logo de ${company.name}`}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
              ) : (
                <Building2 size={32} className="text-gray-400" />
              )}
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{company.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Hash size={14} />
                  <span>RUC: {company.ruc}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Creado: {new Intl.DateTimeFormat('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }).format(new Date(company.createdAt))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón editar */}
          <Link
            href={`/admin/empresas/${company.id}/editar`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 size={18} />
            Editar Empresa
          </Link>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        {activeTab === 'general' && (
          <GeneralTab company={company} />
        )}
        
        {activeTab === 'bank' && (
          <BankAccountsTab bankAccounts={company.bankAccounts} />
        )}
        
        {activeTab === 'wallets' && (
          <WalletsTab wallets={company.wallets} />
        )}
      </div>
    </div>
  );
}

/**
 * Pestaña de información general
 */
function GeneralTab({ company }: { company: Company }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {/* Información básica */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
          <div className="space-y-4">
            <InfoField
              icon={Building2}
              label="Nombre de la empresa"
              value={company.name}
            />
            <InfoField
              icon={Hash}
              label="RUC"
              value={company.ruc}
            />
            {company.email && (
              <InfoField
                icon={Mail}
                label="Correo electrónico"
                value={company.email}
              />
            )}
            {company.phone && (
              <InfoField
                icon={Phone}
                label="Teléfono"
                value={company.phone}
              />
            )}
            {company.whatsapp && (
              <InfoField
                icon={MessageCircle}
                label="WhatsApp"
                value={company.whatsapp}
              />
            )}
            {company.address && (
              <InfoField
                icon={MapPin}
                label="Dirección"
                value={company.address}
              />
            )}
          </div>
        </div>
      </div>

      {/* Información corporativa */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Corporativa</h3>
          <div className="space-y-4">
            {company.legalRepresentative && (
              <InfoField
                icon={Shield}
                label="Representante Legal"
                value={company.legalRepresentative}
              />
            )}
            {company.administrator && (
              <InfoField
                icon={UserCheck}
                label="Administrador"
                value={company.administrator}
              />
            )}
            {company.website && (
              <InfoField
                icon={Globe}
                label="Sitio web"
                value={company.website}
                isLink={true}
              />
            )}
            {company.slogan && (
              <InfoField
                icon={User}
                label="Eslogan"
                value={company.slogan}
              />
            )}
            {company.description && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Descripción</span>
                </div>
                <p className="text-gray-900 leading-relaxed">{company.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Redes sociales */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociales</h3>
          <div className="space-y-4">
            {company.facebookUrl && (
              <InfoField
                icon={Facebook}
                label="Facebook"
                value={company.facebookUrl}
                isLink={true}
              />
            )}
            {company.instagramUrl && (
              <InfoField
                icon={Instagram}
                label="Instagram"
                value={company.instagramUrl}
                isLink={true}
              />
            )}
            {company.tiktokUrl && (
              <InfoField
                icon={Music}
                label="TikTok"
                value={company.tiktokUrl}
                isLink={true}
              />
            )}
            
            {!company.facebookUrl && !company.instagramUrl && !company.tiktokUrl && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No hay redes sociales registradas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pestaña de cuentas bancarias
 */
function BankAccountsTab({ bankAccounts }: { bankAccounts: BankAccount[] }) {
  if (bankAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuentas bancarias</h3>
        <p className="text-gray-500">Esta empresa no tiene cuentas bancarias registradas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bankAccounts.map((account) => (
        <div key={account.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{account.bank}</h4>
              <p className="text-sm text-gray-600 mb-3">{account.accountType}</p>
              
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-500">Número de cuenta</span>
                  <p className="text-sm font-mono text-gray-900">{account.number}</p>
                </div>
                
                {account.cci && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">CCI</span>
                    <p className="text-sm font-mono text-gray-900">{account.cci}</p>
                  </div>
                )}
                
                {account.alias && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Alias</span>
                    <p className="text-sm text-gray-900">{account.alias}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-xs font-medium text-gray-500">Moneda</span>
                  <p className="text-sm text-gray-900">{account.currency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Pestaña de billeteras digitales
 */
function WalletsTab({ wallets }: { wallets: Wallet[] }) {
  if (wallets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay billeteras digitales</h3>
        <p className="text-gray-500">Esta empresa no tiene billeteras digitales registradas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wallets.map((wallet) => (
        <div key={wallet.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              wallet.type === 'YAPE' ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              <Smartphone size={20} className={
                wallet.type === 'YAPE' ? 'text-purple-600' : 'text-blue-600'
              } />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{wallet.type}</h4>
              
              <div className="space-y-2 mt-3">
                <div>
                  <span className="text-xs font-medium text-gray-500">Teléfono</span>
                  <p className="text-sm font-mono text-gray-900">{wallet.phone}</p>
                </div>
                
                {wallet.qrUrl && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">QR</span>
                    <p className="text-sm text-gray-900">Disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Componente para mostrar un campo de información
 */
interface InfoFieldProps {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  value: string;
  isLink?: boolean;
}

function InfoField({ icon: Icon, label, value, isLink = false }: InfoFieldProps) {
  const getIconColor = () => {
    switch (label) {
      case 'Facebook':
        return 'text-blue-600';
      case 'Instagram':
        return 'text-pink-600';
      case 'TikTok':
        return 'text-black';
      case 'WhatsApp':
        return 'text-green-600';
      case 'Representante Legal':
        return 'text-purple-600';
      case 'Administrador':
        return 'text-indigo-600';
      default:
        return 'text-gray-400';
    }
  };

  const formatDisplayValue = () => {
    if (isLink) {
      // Para redes sociales y sitios web, mostrar solo el dominio o nombre de usuario
      if (value.includes('facebook.com')) {
        return value.split('facebook.com/')[1] || value;
      }
      if (value.includes('instagram.com')) {
        return '@' + (value.split('instagram.com/')[1] || value);
      }
      if (value.includes('tiktok.com')) {
        return '@' + (value.split('tiktok.com/@')[1] || value.split('tiktok.com/')[1] || value);
      }
      return value.replace(/^https?:\/\//, '').replace(/^www\./, '');
    }
    return value;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={getIconColor()} />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      {isLink ? (
        <a
          href={value.startsWith('http') ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
        >
          {formatDisplayValue()}
          <Globe size={12} className="opacity-60" />
        </a>
      ) : (
        <p className="text-gray-900">{value}</p>
      )}
    </div>
  );
}