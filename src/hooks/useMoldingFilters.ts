import { useState, useEffect } from 'react'

interface MoldingFilterOptions {
  qualities?: Array<{ value: string; label: string }>
  thicknesses?: Array<{ id: number; name: string }>
}

interface MoldingFilters {
  quality: string
  thicknessId: string
  search: string
}

export function useMoldingFilters(companyId: number) {
  const [filters, setFilters] = useState<MoldingFilters>({
    quality: '',
    thicknessId: '',
    search: ''
  })

  const [options, setOptions] = useState<MoldingFilterOptions>({})
  const [loading, setLoading] = useState(false)

  // Función para obtener opciones de filtros
  const fetchOptions = async () => {
    if (!companyId) return

    setLoading(true)
    try {
      // Obtener calidades (estáticas)
      const qualities = [
        { value: 'SIMPLE', label: '🔹 Simple' },
        { value: 'FINA', label: '✨ Fina' },
        { value: 'BASTIDOR', label: '🔲 Bastidor' }
      ]

      let thicknesses: Array<{ id: number; name: string }> = []

      // Si hay una calidad seleccionada, obtener solo espesores disponibles para esa calidad
      if (filters.quality) {
        console.log('Fetching thicknesses for quality:', filters.quality)
        const thicknessResponse = await fetch(`/api/pricing/thicknesses-by-quality?companyId=${companyId}&quality=${filters.quality}`)
        
        if (thicknessResponse.ok) {
          thicknesses = await thicknessResponse.json()
          console.log('Thicknesses for quality', filters.quality, ':', thicknesses)
        } else {
          console.error('Error fetching thicknesses by quality:', thicknessResponse.status)
        }
      } else {
        // Si no hay calidad seleccionada, obtener todos los espesores
        const thicknessResponse = await fetch(`/api/pricing/thicknesses?companyId=${companyId}`)
        
        if (thicknessResponse.ok) {
          thicknesses = await thicknessResponse.json()
        }
      }

      setOptions({ qualities, thicknesses })
    } catch (error) {
      console.error('Error fetching molding filter options:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar opciones iniciales y cuando cambie la calidad
  useEffect(() => {
    if (companyId) {
      fetchOptions()
    }
  }, [companyId, filters.quality])

  // Función para actualizar filtros con cascada
  const updateFilter = (key: keyof MoldingFilters, value: string) => {
    console.log(`Updating molding filter ${key} to:`, value)
    
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      
      // Cascada: si cambia la calidad, limpiar espesor
      if (key === 'quality') {
        newFilters.thicknessId = ''
        console.log('Quality changed, clearing thicknessId and will reload thickness options')
      }

      console.log('New molding filters:', newFilters)
      return newFilters
    })
  }

  const resetFilters = () => {
    setFilters({
      quality: '',
      thicknessId: '',
      search: ''
    })
  }

  console.log('useMoldingFilters state:', { filters, options, loading })

  return {
    filters,
    options,
    loading,
    updateFilter,
    resetFilters,
    setSearch: (search: string) => setFilters(prev => ({ ...prev, search }))
  }
}

// Hook para obtener molduras filtradas
export function useFilteredMoldings(companyId: number, filters: MoldingFilters) {
  const [moldings, setMoldings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!companyId) return

    const fetchMoldings = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          companyId: companyId.toString()
        })

        if (filters.quality) params.append('quality', filters.quality)
        if (filters.thicknessId) params.append('thicknessId', filters.thicknessId)

        console.log('Fetching moldings with params:', params.toString())

        const response = await fetch(`/api/pricing/moldings?${params}`)
        if (response.ok) {
          const data = await response.json()
          console.log('Received moldings:', data)
          setMoldings(data)
        } else {
          console.error('Moldings API response not ok:', response.status)
          setMoldings([])
        }
      } catch (error) {
        console.error('Error fetching moldings:', error)
        setMoldings([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce para búsqueda
    const timeoutId = setTimeout(fetchMoldings, filters.search ? 300 : 0)
    return () => clearTimeout(timeoutId)

  }, [companyId, filters.quality, filters.thicknessId, filters.search])

  return { moldings, loading }
}