import { useState, useEffect } from 'react'

interface Glass2mmFilters {
  family: string
  colorType: string
  search: string
}

// Hook específico para obtener vidrios de 2mm para cuadros
export function useGlass2mmForFrames(companyId: number) {
  const [filters, setFilters] = useState<Glass2mmFilters>({
    family: '',
    colorType: '',
    search: ''
  })

  const [glasses, setGlasses] = useState<any[]>([])
  const [options, setOptions] = useState<{
    families?: string[]
    colorTypes?: string[]
  }>({})
  const [loading, setLoading] = useState(false)

  // Función para obtener opciones de filtros
  const fetchOptions = async () => {
    if (!companyId) return

    try {
      // Obtener familias disponibles con vidrios de 2mm
      if (!filters.family) {
        console.log('Fetching available families for 2mm glasses...')
        const familiesResponse = await fetch(`/api/calculator/glass-families-2mm?companyId=${companyId}`)
        if (familiesResponse.ok) {
          const familiesData = await familiesResponse.json()
          console.log('Available families for 2mm:', familiesData)
          const families = familiesData.map((item: any) => item.family)
          setOptions(prev => ({ ...prev, families }))
        } else {
          console.error('Error fetching families for 2mm glasses:', familiesResponse.status)
        }
      }

      // Obtener tipos de color para la familia seleccionada (solo si hay familia)
      if (filters.family) {
        const params = new URLSearchParams({
          companyId: companyId.toString(),
          thickness: '2',
          family: filters.family
        })

        console.log('Fetching color types for family:', filters.family)
        const response = await fetch(`/api/calculator/glass-options?${params}`)
        if (response.ok) {
          const data = await response.json()
          console.log('Color types for family', filters.family, ':', data.colorTypes)
          setOptions(prev => ({ ...prev, colorTypes: data.colorTypes }))
        } else {
          console.error('Error fetching color types:', response.status)
        }
      }
    } catch (error) {
      console.error('Error fetching glass options for frames:', error)
    }
  }

  // Función para obtener vidrios filtrados
  const fetchGlasses = async () => {
    if (!companyId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        companyId: companyId.toString(),
        thickness: '2' // Solo vidrios de 2mm
      })

      if (filters.family) params.append('family', filters.family)
      if (filters.colorType) params.append('colorType', filters.colorType)
      if (filters.search) params.append('search', filters.search)

      console.log('Fetching 2mm glasses with params:', params.toString())

      const response = await fetch(`/api/calculator/glasses?${params}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Received 2mm glasses:', data)
        setGlasses(data)
      } else {
        console.error('2mm glasses API response not ok:', response.status)
        setGlasses([])
      }
    } catch (error) {
      console.error('Error fetching 2mm glasses:', error)
      setGlasses([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar opciones iniciales y cuando cambie la familia
  useEffect(() => {
    if (companyId) {
      fetchOptions()
    }
  }, [companyId, filters.family])

  // Cargar vidrios cuando cambian los filtros
  useEffect(() => {
    if (companyId) {
      const timeoutId = setTimeout(fetchGlasses, filters.search ? 300 : 0)
      return () => clearTimeout(timeoutId)
    }
  }, [companyId, filters.family, filters.colorType, filters.search])

  // Función para actualizar filtros con cascada
  const updateFilter = (key: keyof Glass2mmFilters, value: string) => {
    console.log(`Updating glass filter ${key} to:`, value)
    
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      
      // Cascada: si cambia la familia, limpiar tipo de color
      if (key === 'family') {
        newFilters.colorType = ''
        console.log('Family changed, clearing colorType and will reload color type options')
        // Limpiar opciones de tipos de color
        setOptions(prevOptions => ({
          ...prevOptions,
          colorTypes: []
        }))
      }

      return newFilters
    })
  }

  const resetFilters = () => {
    setFilters({
      family: '',
      colorType: '',
      search: ''
    })
  }

  return {
    filters,
    options,
    glasses,
    loading,
    updateFilter,
    resetFilters,
    setSearch: (search: string) => setFilters(prev => ({ ...prev, search }))
  }
}