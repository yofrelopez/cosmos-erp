'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, FileText, LogOut, Building, DollarSign, Calculator, Frame, Settings, Zap, ChevronDown, Home } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import NavGroup from './NavGroup';
import SidebarToggle from './SidebarToggle';

const getNavigationGroups = (userRole?: string) => [
  {
    label: 'Inicio',
    items: [
      { 
        href: '/dashboard', 
        label: 'Dashboard', 
        icon: Home,
        shortcut: 'Ctrl+H'
      },
    ]
  },
  {
    label: 'Calculadoras',
    items: [
      { 
        href: '/admin/cotizaciones/calculadora-vidrios', 
        label: 'Vidrios', 
        icon: Calculator,
        shortcut: 'Ctrl+V'
      },
      { 
        href: '/admin/cotizaciones/calculadora-cuadros', 
        label: 'Cuadros', 
        icon: Frame,
        shortcut: 'Ctrl+C'
      },
    ]
  },
  {
    label: 'Ventas',
    items: [
      { 
        href: '/admin/clientes', 
        label: 'Clientes', 
        icon: User,
        badge: '12',
        shortcut: 'Ctrl+U'
      },
      { 
        href: '/admin/cotizaciones', 
        label: 'Cotizaciones', 
        icon: FileText,
        badge: '3',
        shortcut: 'Ctrl+Q'
      },
    ]
  },
  {
    label: 'Precios',
    items: [
      { 
        href: '/admin/precios/vidrios', 
        label: 'Vidrios', 
        icon: DollarSign,
        shortcut: 'Ctrl+P+V'
      },
      { 
        href: '/admin/precios/molduras', 
        label: 'Molduras', 
        icon: Frame,
        shortcut: 'Ctrl+P+M'
      },
    ]
  },
  {
    label: 'Sistema',
    items: [
      { 
        href: '/admin/empresas', 
        label: 'Empresas', 
        icon: Building,
        shortcut: 'Ctrl+E'
      },
      ...(userRole === 'SUPER_ADMIN' ? [{
        href: '/admin/usuarios', 
        label: 'Usuarios', 
        icon: Settings,
        shortcut: 'Ctrl+Alt+U',
        badge: 'Admin'
      }] : [])
    ]
  },
];

export default function Sidebar() {
  const { isCollapsed, isMobile, toggle } = useSidebar();
  const { data: session } = useSession();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Overlay para móvil */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out flex flex-col ${
          isCollapsed 
            ? isMobile 
              ? '-translate-x-full' 
              : 'w-16' 
            : 'w-64'
        } ${isMobile && !isCollapsed ? 'shadow-2xl' : ''}`}
      >
        {/* Header con logo y toggle */}
        <div className={`flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100 ${
          isCollapsed && !isMobile ? 'flex-col gap-4' : ''
        }`}>
          {(!isCollapsed || isMobile) && (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/logo_2.png"
                  alt="ERP Cosmos Logo"
                  width={48}
                  height={48}
                  className="object-contain rounded-lg bg-white p-1 shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow"
                  priority
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                  ERP COSMOS
                </span>
                <span className="text-xs text-gray-500 truncate">
                  V&D COSMOS SRL
                </span>
              </div>
            </Link>
          )}
          
          {isCollapsed && !isMobile && (
            <Link href="/" className="group">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/logo_2.png"
                  alt="ERP Cosmos"
                  width={40}
                  height={40}
                  className="object-contain rounded-lg bg-white p-1 shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow"
                  priority
                />
              </div>
            </Link>
          )}

          {/* Solo mostrar toggle en desktop */}
          {!isMobile && (
            <SidebarToggle 
              isCollapsed={isCollapsed}
              isMobile={isMobile}
              onToggle={toggle}
            />
          )}
        </div>



        {/* Navigation - Área con scroll adaptativo */}
        <div className={`flex-1 overflow-y-auto min-h-0 relative ${
          isCollapsed && !isMobile 
            ? 'py-4 px-1 space-y-4 scrollbar-invisible' 
            : 'py-6 px-2 space-y-6 scrollbar-thin'
        }`}>
          {getNavigationGroups(session?.user?.role).map((group, index) => (
            <NavGroup 
              key={index} 
              group={group} 
              isCollapsed={isCollapsed && !isMobile} 
            />
          ))}
          
          {/* Indicadores sutiles de scroll para modo colapsado */}
          {isCollapsed && !isMobile && (
            <>
              {/* Indicador superior - muy sutil */}
              <div className="absolute top-0 left-1 right-1 h-3 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10" />
              {/* Indicador inferior - muy sutil */}
              <div className="absolute bottom-0 left-1 right-1 h-3 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
            </>
          )}
        </div>

        {/* Footer - User Info & Logout */}
        <div className="flex-shrink-0 border-t border-gray-100 p-2">
          {isCollapsed && !isMobile ? (
            /* Modo colapsado - Solo avatar */
            <div className="group relative flex justify-center" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200"
              >
                <User size={16} />
              </button>
              
              {/* Dropdown en modo colapsado */}
              {showUserDropdown && (
                <div className="absolute left-full bottom-0 ml-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{session?.user?.name || 'Usuario'}</p>
                        <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                        {session?.user?.companyName && (
                          <p className="text-xs text-blue-600 truncate">📍 {session.user.companyName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3 space-y-1">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                        👤 Perfil
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                        ⚙️ Configuración
                      </button>
                      <button 
                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        🚪 Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Modo expandido - Info completa del usuario */
            <div className="space-y-3" ref={dropdownRef}>
              {/* User info card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-900 truncate">{session?.user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                    {session?.user?.companyName && (
                      <p className="text-xs text-blue-600 truncate">📍 {session.user.companyName}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 font-medium">
                        {session?.user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                         session?.user?.role === 'ADMIN' ? 'Administrador' : 'Operador'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronDown size={16} className={`transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {/* Dropdown menu expandido */}
                {showUserDropdown && (
                  <div className="mt-3 pt-3 border-t border-blue-200 space-y-1">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white hover:bg-opacity-70 rounded-md transition-all duration-200">
                      👤 Perfil
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white hover:bg-opacity-70 rounded-md transition-all duration-200">
                      ⚙️ Configuración
                    </button>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 font-medium"
                    >
                      🚪 Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
              
              {/* Footer info */}
              <div className="text-center">
                <p className="text-[10px] text-gray-400">
                  v2.1.0 • © 2025 Cosmos
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>


    </>
  );
}