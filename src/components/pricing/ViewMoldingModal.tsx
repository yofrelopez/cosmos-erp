'use client'

import { Button } from '@/components/ui/Button'
import BaseModal, { ModalContent, ModalFooter } from '@/components/ui/BaseModal'
import InfoCard, { Badge, InfoGrid } from '@/components/ui/InfoCard'
import { getModalColors } from '@/components/ui/modal-tokens'
import { Shapes } from 'lucide-react'

const QUALITIES = [
  { value: 'SIMPLE', label: 'Simple' },
  { value: 'FINA', label: 'Fina' },
  { value: 'BASTIDOR', label: 'Bastidor' }
]

// Tipo para moldura serializada
type SerializedMolding = {
  id: number
  name: string
  quality: 'SIMPLE' | 'FINA' | 'BASTIDOR'
  thicknessId: number
  pricePerM: number
  validFrom: Date
  isActive: boolean
  companyId: number
  thickness: {
    id: number
    name: string
  }
}

interface Props {
  open: boolean
  molding: SerializedMolding
  onClose: () => void
}

export default function ViewMoldingModal({ open, molding, onClose }: Props) {
  const colors = getModalColors('molding')

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'SIMPLE':
        return <Badge variant="neutral">Simple</Badge>
      case 'FINA':
        return <Badge variant="warning">Fina</Badge>
      case 'BASTIDOR':
        return <Badge variant="info">Bastidor</Badge>
      default:
        return <Badge variant="neutral">{quality}</Badge>
    }
  }

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title="Detalles de la Moldura"
      description="Información completa de la moldura seleccionada"
      icon={<Shapes className={`h-5 w-5 ${colors.primary}`} />}
      size="lg"
    >
      <ModalContent>
        <div className="space-y-6">
          {/* Header con icono */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center border-2 border-amber-200">
              <Shapes className="w-10 h-10 text-amber-600" />
            </div>
          </div>

          {/* Información principal */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{molding.name}</h3>
            <div className="flex items-center justify-center gap-3">
              {getQualityBadge(molding.quality)}
              <Badge variant={molding.isActive ? 'success' : 'error'}>
                {molding.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>

          {/* Grid de información */}
          <InfoGrid columns={2}>
            <InfoCard
              label="ID de la Moldura"
              value={`#${molding.id}`}
            />
            
            <InfoCard
              label="Espesor"
              value={molding.thickness.name}
            />

            <InfoCard
              label="Precio por Metro"
              value={
                <span className="text-lg font-bold text-green-600">
                  S/ {molding.pricePerM.toFixed(2)}
                </span>
              }
            />

            <InfoCard
              label="Empresa"
              value={`#${molding.companyId}`}
            />

            <InfoCard
              label="Vigente Desde"
              value={new Date(molding.validFrom).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            />

            <InfoCard
              label="Calidad del Material"
              value={QUALITIES.find(q => q.value === molding.quality)?.label || molding.quality}
            />
          </InfoGrid>

          {/* Información adicional */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
              <Shapes className="w-4 h-4" />
              Información del Sistema
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-700">
              <div><strong>Creada:</strong> {new Date(molding.validFrom).toLocaleString('es-PE')}</div>
              <div><strong>Estado:</strong> {molding.isActive ? 'Disponible para uso' : 'Fuera de servicio'}</div>
              <div><strong>Categoría:</strong> Moldura {molding.quality.toLowerCase()}</div>
              <div><strong>Precio/m:</strong> {molding.pricePerM} soles</div>
            </div>
          </div>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </BaseModal>
  )
}