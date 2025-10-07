import { useState, useEffect } from 'react'

interface FilterOptions {
  families?: string[]
  thicknesses?: number[]
  colorTypes?: string[]
  colors?: { id: number; name: string }[]
  textures?: { id: number; name: string }[]
}

interface Filters {
  family: string
  thickness: string
  colorType: string
  colorId: string
  textureId: string
  search: string
}

export function useGlassFilters(companyId: number) {
  const [filters, setFilters] = useState<Filters>({
    family: '',
    thickness: '',
    colorType: '',
    colorId: '',
    textureId: '',
    search: ''
  })

  const [options, setOptions] = useState<FilterOptions>({})
  const [loading, setLoading] = useState(false)

  // Función para obtener opciones basadas en filtros actuales
  const fetchOptions = async () => {
    if (!companyId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        companyId: companyId.toString()
      })

      if (filters.family) params.append('family', filters.family)
      if (filters.thickness) params.append('thickness', filters.thickness)
      if (filters.colorType) params.append('colorType', filters.colorType)

      console.log('Fetching options with params:', params.toString())

      const response = await fetch(`/api/calculator/glass-options?${params}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Received options:', data)
        setOptions(prev => ({ ...prev, ...data }))
      } else {
        console.error('API response not ok:', response.status)
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar opciones iniciales (familias)
  useEffect(() => {
    if (companyId) {
      fetchOptions()
    }
  }, [companyId, filters.family, filters.thickness, filters.colorType])

  // Función para actualizar filtros con cascada
  const updateFilter = (key: keyof Filters, value: string) => {
    console.log(`Updating filter ${key} to:`, value)
    
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }

      // Cascada: limpiar filtros dependientes
      if (key === 'family') {
        newFilters.thickness = ''
        newFilters.colorType = ''
        newFilters.colorId = ''
        newFilters.textureId = ''
        // Limpiar opciones dependientes también
        setOptions(prevOptions => ({
          ...prevOptions,
          thicknesses: [],
          colorTypes: [],
          colors: [],
          textures: []
        }))
      } else if (key === 'thickness') {
        newFilters.colorType = ''
        newFilters.colorId = ''
        newFilters.textureId = ''
        // Limpiar opciones dependientes
        setOptions(prevOptions => ({
          ...prevOptions,
          colorTypes: [],
          colors: [],
          textures: []
        }))
      } else if (key === 'colorType') {
        newFilters.colorId = ''
        // Limpiar colores específicos
        setOptions(prevOptions => ({
          ...prevOptions,
          colors: []
        }))
      }

      console.log('New filters:', newFilters)
      return newFilters
    })
  }

  const resetFilters = () => {
    setFilters({
      family: '',
      thickness: '',
      colorType: '',
      colorId: '',
      textureId: '',
      search: ''
    })
  }

  console.log('useGlassFilters state:', { filters, options, loading })

  return {
    filters,
    options,
    loading,
    updateFilter,
    resetFilters,
    setSearch: (search: string) => setFilters(prev => ({ ...prev, search }))
  }
}

// Hook para obtener vidrios filtrados
export function useFilteredGlasses(companyId: number, filters: Filters) {
  const [glasses, setGlasses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!companyId) return

    const fetchGlasses = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          companyId: companyId.toString()
        })

        if (filters.family) params.append('family', filters.family)
        if (filters.thickness) params.append('thickness', filters.thickness)
        if (filters.colorType) params.append('colorType', filters.colorType)
        // NO enviar colorId - es solo para información de cotización
        // if (filters.colorId) params.append('colorId', filters.colorId)
        if (filters.search) params.append('search', filters.search)

        const response = await fetch(`/api/calculator/glasses?${params}`)
        if (response.ok) {
          const data = await response.json()
          setGlasses(data)
        }
      } catch (error) {
        console.error('Error fetching glasses:', error)
        setGlasses([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce para búsqueda
    const timeoutId = setTimeout(fetchGlasses, filters.search ? 300 : 0)
    return () => clearTimeout(timeoutId)

  }, [companyId, filters.family, filters.thickness, filters.colorType, filters.search]) // Sin filters.colorId

  return { glasses, loading }
}