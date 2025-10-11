import { useState, useEffect } from 'react'

interface FrameGlass {
  id: number
  name: string
  category: 'VIDRIO' | 'ESPEJO'
  thickness: number
  unitPrice: number
  isDefault: boolean
}

export function useFrameGlasses(companyId: number) {
  const [glasses, setGlasses] = useState<FrameGlass[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedGlass, setSelectedGlass] = useState<FrameGlass | null>(null)

  useEffect(() => {
    if (!companyId) return

    const fetchFrameGlasses = async () => {
      setLoading(true)
      try {
        console.log('🔍 Fetching frame glasses for companyId:', companyId)
        
        const response = await fetch(`/api/pricing/frame-glasses?companyId=${companyId}`)
        
        if (response.ok) {
          const data: FrameGlass[] = await response.json()
          console.log('✅ Frame glasses received:', data)
          
          setGlasses(data)
          
          // Seleccionar automáticamente el vidrio por defecto
          const defaultGlass = data.find(glass => glass.isDefault)
          if (defaultGlass && !selectedGlass) {
            setSelectedGlass(defaultGlass)
            console.log('🎯 Auto-selected default glass:', defaultGlass.name)
          }
        } else {
          console.error('❌ Error fetching frame glasses:', response.status)
          setGlasses([])
        }
      } catch (error) {
        console.error('❌ Network error fetching frame glasses:', error)
        setGlasses([])
      } finally {
        setLoading(false)
      }
    }

    fetchFrameGlasses()
  }, [companyId])

  // Función para cambiar selección
  const selectGlass = (glass: FrameGlass) => {
    setSelectedGlass(glass)
    console.log('🪟 Selected glass:', glass.name)
  }

  // Resetear selección
  const resetSelection = () => {
    const defaultGlass = glasses.find(glass => glass.isDefault)
    setSelectedGlass(defaultGlass || null)
  }

  // Agrupar por categoría para renderizado
  const groupedGlasses = {
    vidrios: glasses.filter(glass => glass.category === 'VIDRIO'),
    espejos: glasses.filter(glass => glass.category === 'ESPEJO')
  }

  return {
    glasses,
    groupedGlasses,
    selectedGlass,
    loading,
    selectGlass,
    resetSelection
  }
}