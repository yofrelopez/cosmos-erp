// src/components/ui/Button.tsx
// -----------------------------------------------------------------------------
// 🟢 Reestructurado para usar diseño moderno y accesible basado en Radix UI
// -----------------------------------------------------------------------------

import {
  ButtonHTMLAttributes,
  ComponentType,
  ReactNode,
  forwardRef,
  isValidElement,
  cloneElement,
} from 'react';
import {
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Plus, // ⬅️ agrega esta línea
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/* 🔖 Tipos                                                                    */
/* -------------------------------------------------------------------------- */
export type ActionIcon = 'edit' | 'delete' | 'save' | 'cancel' | 'add';

export type ButtonTone = 'primary' | 'success' | 'danger' | 'neutral';
export type ButtonVariant = 'solid' | 'outline' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  action?: ActionIcon;
}

/* -------------------------------------------------------------------------- */
/* 🎨 Tokens de estilo                                                         */
/* -------------------------------------------------------------------------- */
const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 cursor-pointer transition-colors duration-150 ease-in-out';

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const iconSize = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const tones: Record<ButtonTone, any> = {
  primary: {
    solid: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline:
      'border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-blue-600 bg-transparent hover:bg-blue-50 focus:ring-blue-500',
  },
  success: {
    solid: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline:
      'border border-green-600 text-green-600 bg-transparent hover:bg-green-50 focus:ring-green-500',
    ghost: 'text-green-600 bg-transparent hover:bg-green-50 focus:ring-green-500',
  },
  danger: {
    solid: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline:
      'border border-red-600 text-red-600 bg-transparent hover:bg-red-50 focus:ring-red-500',
    ghost: 'text-red-600 bg-transparent hover:bg-red-50 focus:ring-red-500',
  },
  neutral: {
    solid: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline:
      'border border-gray-500 text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500',
    ghost: 'text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500',
  },
};

/* -------------------------------------------------------------------------- */
/* 🖼️ Íconos semánticos                                                       */
/* -------------------------------------------------------------------------- */
const icons: Record<ActionIcon, ComponentType<{ className?: string }>> = {
  edit: Pencil,
  delete: Trash2,
  save: Check,
  cancel: X,
  add: Plus, // ⬅️ nueva acción
};

const defaultTone: Record<ActionIcon, ButtonTone> = {
  edit: 'primary',
  delete: 'danger',
  save: 'success',
  cancel: 'neutral',
    add: 'primary',

};

const defaultVariant: Record<ActionIcon, ButtonVariant> = {
  edit: 'outline',
  delete: 'solid',
  save: 'solid',
  cancel: 'outline',
   add: 'solid',
};

/* -------------------------------------------------------------------------- */
/* 🔄 Spinner                                                                 */
/* -------------------------------------------------------------------------- */
const Spinner = ({ size = 'sm' }: { size?: keyof typeof iconSize }) => (
  <Loader2 className={cn(iconSize[size], 'animate-spin')} aria-hidden="true" />
);

/* -------------------------------------------------------------------------- */
/* 🖱️ Componente Button                                                      */
/* -------------------------------------------------------------------------- */
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    size = 'sm',
    tone,
    variant,
    action,
    icon,
    loading = false,
    className,
    children,
    disabled,
    ...rest
  } = props;

  const resolvedTone: ButtonTone = tone ?? (action ? defaultTone[action] : 'primary');
  const resolvedVariant: ButtonVariant =
    variant ?? (action ? defaultVariant[action] : 'solid');

  const classes = cn(
    base,
    sizeClasses[size],
    tones[resolvedTone][resolvedVariant],
    className
  );

  let leftIcon: ReactNode = null;

  if (loading) {
    leftIcon = <Spinner size={size} />;
  } else if (icon && isValidElement(icon)) {
    leftIcon = cloneElement(icon as React.ReactElement<any>, {
      className: cn((icon.props as any).className, iconSize[size]),
    });
  } else if (action) {
    const Icon = icons[action];
    leftIcon = <Icon className={iconSize[size]} />;
  }

  return (
    <button
      ref={ref}
      aria-busy={loading}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {leftIcon}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export { Button };
