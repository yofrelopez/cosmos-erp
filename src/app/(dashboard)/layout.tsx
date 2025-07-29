// src/app/(dashboard)/layout.tsx
import { ReactNode } from 'react';
import Sidebar from '@/components/ui/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
