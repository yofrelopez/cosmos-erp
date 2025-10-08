'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export default function FormField({
  label,
  required = false,
  error,
  description,
  children,
  className
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-xs text-gray-500 -mt-1">
          {description}
        </p>
      )}
      
      {children}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// Componente para Input con estilos consistentes
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function FormInput({ error, className, ...props }: FormInputProps) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        error 
          ? "border-red-300 focus:ring-red-500" 
          : "border-gray-300 hover:border-gray-400",
        className
      )}
      {...props}
    />
  )
}

// Componente para Select con estilos consistentes
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  children: React.ReactNode
}

export function FormSelect({ error, className, children, ...props }: FormSelectProps) {
  return (
    <select
      className={cn(
        "w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200 bg-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        error 
          ? "border-red-300 focus:ring-red-500" 
          : "border-gray-300 hover:border-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

// Componente para Textarea con estilos consistentes
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function FormTextarea({ error, className, ...props }: FormTextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200 resize-vertical",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        error 
          ? "border-red-300 focus:ring-red-500" 
          : "border-gray-300 hover:border-gray-400",
        className
      )}
      {...props}
    />
  )
}