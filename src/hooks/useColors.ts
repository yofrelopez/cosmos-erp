import { useState, useEffect } from 'react'

export interface Color {
  id: number
  name: string
}

export function useColors() {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/pricing/colors')
        if (!response.ok) {
          throw new Error('Error al cargar los colores')
        }
        const data = await response.json()
        setColors(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchColors()
  }, [])

  return { colors, loading, error }
}