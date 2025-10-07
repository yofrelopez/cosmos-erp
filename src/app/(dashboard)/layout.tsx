// src/app/(dashboard)/layout.tsx
'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function DashboardContent({ children }: { children: ReactNode }) {
  const { isCollapsed, isMobile } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Contenido principal con margen dinámico */}
      <main 
        className={`transition-all duration-300 ease-in-out ${
          isMobile 
            ? 'ml-0' 
            : isCollapsed 
              ? 'ml-16' 
              : 'ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
    </SidebarProvider>
  );
}
