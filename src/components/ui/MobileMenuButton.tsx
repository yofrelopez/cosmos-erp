'use client';

import { Menu, X } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

export default function MobileMenuButton() {
  const { isCollapsed, isMobile, toggle } = useSidebar();

  // Solo mostrar en móvil
  if (!isMobile) return null;

  return (
    <button
      onClick={toggle}
      className="bg-blue-800 hover:bg-blue-900 text-white p-2 rounded-lg transition-all duration-200"
      aria-label={isCollapsed ? 'Abrir menú' : 'Cerrar menú'}
    >
      {isCollapsed ? (
        <Menu className="w-4 h-4" />
      ) : (
        <X className="w-4 h-4" />
      )}
    </button>
  );
}