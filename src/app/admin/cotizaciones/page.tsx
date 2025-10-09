"use client";

import Link from "next/link";
import QuoteTable from "@/components/quotes/QuoteTable";
import PageHeader from "@/components/common/PageHeader";
import { useCompanyStore } from "@/lib/store/useCompanyStore";
import { FileText, Plus, Calculator, Frame } from "lucide-react";
import { useEffect, useState } from "react";

export default function QuotesPage() {
  const companyId = useCompanyStore((s) => s.company?.id);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  // Cargar estadísticas
  useEffect(() => {
    if (companyId) {
      fetch(`/api/quotes/stats?companyId=${companyId}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => setStats({ total: 0, pending: 0, approved: 0 }));
    }
  }, [companyId]);

  if (!companyId) {
    return (
      <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una empresa</h3>
            <p className="text-gray-500">Para ver las cotizaciones necesitas seleccionar una empresa primero.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-2.5 sm:p-6 space-y-4 sm:space-y-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestión de Cotizaciones"
          subtitle="Administra y crea nuevas cotizaciones para tus clientes"
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Admin', href: '/' },
            { label: 'Cotizaciones', href: '/cotizaciones' },
          ]}
        />

        {/* Contenedor principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header con estadísticas */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cotizaciones Registradas
                  </h2>
                  <p className="text-sm text-gray-600">
                    {stats.total} {stats.total === 1 ? 'cotización registrada' : 'cotizaciones registradas'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/admin/cotizaciones/nueva"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus size={18} />
                  Nueva Cotización
                </Link>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <FileText size={20} className="text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                  <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/admin/cotizaciones/calculadora-vidrios"
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
              >
                <Calculator size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Calculadora Vidrios</span>
              </Link>
              
              <Link 
                href="/admin/cotizaciones/calculadora-cuadros"
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-purple-50 hover:border-purple-200 transition-all duration-200"
              >
                <Frame size={18} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Calculadora Cuadros</span>
              </Link>
            </div>
          </div>

          {/* Tabla de cotizaciones */}
          <QuoteTable fetchUrl={`/api/quotes?companyId=${companyId}`} />
        </div>
      </div>
    </main>
  );
}
