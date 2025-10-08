'use client'

import BaseModal from '@/components/ui/BaseModal'
import InfoCard, { Badge } from '@/components/ui/InfoCard'
import { getModalColors } from '@/components/ui/modal-tokens'
import { Square, Hash, Eye, Calendar, DollarSign, Layers } from 'lucide-react'
import type { SerializedPricingGlass } from '@/types/newTypes'

interface Props {
  open: boolean
  onClose: () => void
  glass: SerializedPricingGlass
}

const GLASS_FAMILIES_LABELS = {
  'PLANO': 'Plano',
  'CATEDRAL': 'Catedral',
  'TEMPLADO': 'Templado',
  'ESPEJO': 'Espejo'
}

const GLASS_COLOR_TYPES_LABELS = {
  'INCOLORO': 'Incoloro',
  'COLOR': 'Color',
  'POLARIZADO': 'Polarizado'
}

export default function ViewGlassModal({ open, onClose, glass }: Props) {
  const colors = getModalColors('glass')
  
  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`
  }

  const getFamilyLabel = (family: string) => {
    return GLASS_FAMILIES_LABELS[family as keyof typeof GLASS_FAMILIES_LABELS] || family
  }

  const getColorDisplay = () => {
    const colorTypeLabel = GLASS_COLOR_TYPES_LABELS[glass.colorType as keyof typeof GLASS_COLOR_TYPES_LABELS] || glass.colorType
    if (glass.colorName) {
      return `${colorTypeLabel} (${glass.colorName})`
    }
    return colorTypeLabel
  }

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title="Detalles del Vidrio"
      description={`Información completa del vidrio: ${glass.commercialName}`}
      icon={<Square size={20} className={colors.primary} />}
      size="lg"
      showCloseButton
    >
      <div className="p-6 space-y-6">
        {/* Información Principal */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Eye size={16} className="text-gray-500" />
            <span>Información Principal</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard 
              label="ID del Vidrio"
              value={
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gray-400" />
                  <span>#{glass.id}</span>
                </div>
              }
            />
            
            <InfoCard 
              label="Nombre Comercial"
              value={
                <div className="flex items-center gap-2">
                  <Square size={14} className="text-gray-400" />
                  <span className="font-semibold">{glass.commercialName}</span>
                </div>
              }
            />
            
            <InfoCard 
              label="Estado"
              value={<Badge variant={glass.isActive ? "success" : "error"}>
                {glass.isActive ? 'Activo' : 'Inactivo'}
              </Badge>}
            />
          </div>
        </div>

        {/* Especificaciones Técnicas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Layers size={16} className="text-gray-500" />
            <span>Especificaciones Técnicas</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard 
              label="Familia"
              value={getFamilyLabel(glass.family)}
            />
            
            <InfoCard 
              label="Espesor"
              value={`${glass.thicknessMM} mm`}
            />
            
            <InfoCard 
              label="Tipo de Color"
              value={getColorDisplay()}
            />
          </div>
        </div>

        {/* Información de Precios */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <DollarSign size={16} className="text-gray-500" />
            <span>Información de Precios</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard 
              label="Precio Actual"
              value={formatPrice(glass.price)}
              valueClassName="text-green-600 font-bold text-lg"
            />
            
            <InfoCard 
              label="Vigente desde"
              value={new Date(glass.validFrom).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            />
            
            {glass.validTo && (
              <InfoCard 
                label="Vigente hasta"
                value={new Date(glass.validTo).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              />
            )}
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Calendar size={16} className="text-gray-500" />
            <span>Información del Sistema</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard 
              label="Fecha de Creación"
              value={new Date(glass.createdAt).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            />
            
            <InfoCard 
              label="Última Actualización"
              value={new Date(glass.updatedAt).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </BaseModal>
  )
}