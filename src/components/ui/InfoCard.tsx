'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface InfoCardProps {
  label: string
  value: React.ReactNode
  className?: string
  valueClassName?: string
}

export default function InfoCard({ 
  label, 
  value, 
  className,
  valueClassName 
}: InfoCardProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <div className={cn("text-sm text-gray-900 font-medium", valueClassName)}>
        {value}
      </div>
    </div>
  )
}

// Componente para mostrar badges/etiquetas
interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'sm',
  className 
}: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800'
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  }

  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-full',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}

// Componente para grid de información
interface InfoGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function InfoGrid({ 
  children, 
  columns = 1,
  className 
}: InfoGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2', 
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  }

  return (
    <div className={cn(
      'grid gap-4',
      columnClasses[columns],
      className
    )}>
      {children}
    </div>
  )
}