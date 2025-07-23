'use client'

import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

/* ------------------------- Tipos y props ------------------------- */

export interface Action {
  label: string               // Tooltip / aria‑label
  icon: LucideIcon            // Icono de Lucide (Eye, Pencil, Trash…)
  onClick: () => void         // Callback al hacer clic
  variant?: 'default' | 'danger'
  disabled?: boolean
}

interface RowActionsProps {
  actions: Action[]
  size?: 'sm' | 'md'          // Tamaño de botón (p‑1 o p‑2)
  className?: string          // Clases extra si las necesitas
}

/* ------------------------- Componente ---------------------------- */

export default function RowActions({
  actions,
  size = 'md',
  className = '',
}: RowActionsProps) {
  const padding = size === 'sm' ? 'p-1' : 'p-2'
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <div className={clsx('flex gap-2', className)}>
      {actions.map(({ label, icon: Icon, onClick, variant = 'default', disabled }, idx) => (
        <button
          key={idx}
          onClick={onClick}
          title={label}
          aria-label={label}
          disabled={disabled}
          className={clsx(
            'inline-flex items-center justify-center rounded-md transition-colors cursor-pointer',
            padding,
            disabled && 'opacity-50 cursor-not-allowed',
            variant === 'default' && 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            variant === 'danger' && 'bg-red-100 text-red-600 hover:bg-red-200'
          )}
        >
          <Icon className={iconSize} />
        </button>
      ))}
    </div>
  )
}
