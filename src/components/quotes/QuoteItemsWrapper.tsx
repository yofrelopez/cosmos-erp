'use client'

import { useEffect, useState } from 'react'
import { QuoteItem } from '@/types'
import QuoteItemsForm from './QuoteItemsForm'

const LOCAL_STORAGE_KEY = 'quoteItems'

export default function QuoteItemsWrapper() {
  const [items, setItems] = useState<QuoteItem[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading from localStorage', error)
    } finally {
      setIsMounted(true)
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Error saving to localStorage', error)
      }
    }
  }, [items, isMounted])

  const handleClear = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    setItems([])
  }

  if (!isMounted) return null

  return (
    <div className="space-y-4">
      <QuoteItemsForm />
    </div>
  )
}
