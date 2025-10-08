'use client'

import BaseModal from '@/components/ui/BaseModal'
import InfoCard, { Badge } from '@/components/ui/InfoCard'
import { getModalColors } from '@/components/ui/modal-tokens'
import { Ruler, Hash, Building2, Info } from 'lucide-react'
import { PricingThickness } from '@prisma/client'

interface Props {
  open: boolean
  thickness: PricingThickness
  onClose: () => void
}

export default function ViewThicknessModal({ open, thickness, onClose }: Props) {
  const colors = getModalColors('default')

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title="Detalles del Espesor"
      description={`Información completa del espesor: ${thickness.name}`}
      icon={<Ruler size={20} className={colors.primary} />}
      size="md"
      showCloseButton
    >
      <div className="p-6 space-y-6">
        {/* Información Principal */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Info size={16} className="text-gray-500" />
            <span>Información Principal</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard 
              label="ID del Espesor"
              value={
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gray-400" />
                  <span>#{thickness.id}</span>
                </div>
              }
            />
            
            <InfoCard 
              label="Nombre del Espesor"
              value={
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-gray-400" />
                  <span className="font-semibold">{thickness.name}</span>
                </div>
              }
            />
          </div>
        </div>

        {/* Información de Sistema */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Building2 size={16} className="text-gray-500" />
            <span>Información del Sistema</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard 
              label="ID de Empresa"
              value={`#${thickness.companyId}`}
            />
            
            <InfoCard 
              label="Estado"
              value={<Badge variant="success">Activo</Badge>}
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