"use client";

import Link from "next/link";
import QuoteTable from "@/components/quotes/QuoteTable";
import PageHeader from "@/components/common/PageHeader";
import { useCompanyStore } from "@/lib/store/useCompanyStore";
import { FileText, Plus, Calculator, Frame, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function QuotesPage() {
  const companyId = useCompanyStore((s) => s.company?.id);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [tempItems, setTempItems] = useState<any[]>([]);

  // Cargar estadísticas
  useEffect(() => {
    if (companyId) {
      fetch(`/api/quotes/stats?companyId=${companyId}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => setStats({ total: 0, pending: 0, approved: 0 }));
    }
  }, [companyId]);

  // Detectar ítems temporales en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const itemsFromStorage = localStorage.getItem('quoteItems');
      if (itemsFromStorage) {
        try {
          const parsed = JSON.parse(itemsFromStorage);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTempItems(parsed);
          }
        } catch (e) {
          console.warn('Error al parsear quoteItems desde localStorage', e);
        }
      }
    }
  }, []);

  // Función para limpiar datos temporales
  const clearTempData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quoteItems');
      localStorage.removeItem('quoteItemImages'); // Si existe
      localStorage.removeItem('pendingImages'); // Si existe
      setTempItems([]);
    }
  };

  if (!companyId) {
    return (
      <main className="page-container">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Gestión de Cotizaciones"
            subtitle="Administra y crea nuevas cotizaciones para tus clientes"
            showBreadcrumb={true}
            breadcrumbs={[
              { label: 'Admin', href: '/admin' },
              { label: 'Cotizaciones', href: '/admin/cotizaciones' },
            ]}
          />
          
          <div className="main-card">
            <div className="empty-state-container">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <FileText size={28} className="text-orange-600" />
              </div>
              <h3 className="title-secondary mb-3">
                Selecciona una empresa
              </h3>
              <p className="description-empty-state mb-8 max-w-sm mx-auto">
                Para ver las cotizaciones necesitas seleccionar una empresa primero.
              </p>
              <div className="space-y-3">
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  <FileText size={18} />
                  Ir al Dashboard
                </Link>
                <p className="text-xs text-gray-500">
                  Selecciona una empresa para gestionar cotizaciones
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestión de Cotizaciones"
          subtitle="Administra y crea nuevas cotizaciones para tus clientes"
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Cotizaciones', href: '/admin/cotizaciones' },
          ]}
        />

        {/* Indicador de cotización temporal en progreso */}
        {tempItems.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center animate-pulse">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-orange-800">
                    📝 Tienes una cotización en progreso
                  </h3>
                  <p className="text-xs text-orange-700 mt-1">
                    {tempItems.length} {tempItems.length === 1 ? 'ítem agregado' : 'ítems agregados'} sin guardar
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Link 
                  href="/admin/cotizaciones/nueva"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <Plus size={16} />
                  Continuar Cotización
                </Link>
                <button
                  onClick={clearTempData}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                  title="Limpiar datos temporales"
                >
                  <X size={16} />
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}

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
