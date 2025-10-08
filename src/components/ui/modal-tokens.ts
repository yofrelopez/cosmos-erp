// Design tokens y constantes para el sistema de modales

export const MODAL_ANIMATIONS = {
  overlay: {
    enter: 'data-[state=open]:animate-in data-[state=open]:fade-in-0',
    exit: 'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
  },
  content: {
    enter: 'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
    exit: 'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]'
  }
} as const

export const MODAL_COLORS = {
  // Colores por categoría
  molding: {
    primary: 'text-amber-600',
    bg: 'bg-amber-600 hover:bg-amber-700',
    light: 'bg-amber-50 text-amber-800',
    ring: 'focus:ring-amber-500'
  },
  glass: {
    primary: 'text-blue-600',
    bg: 'bg-blue-600 hover:bg-blue-700',
    light: 'bg-blue-50 text-blue-800',
    ring: 'focus:ring-blue-500'
  },
  texture: {
    primary: 'text-purple-600',
    bg: 'bg-purple-600 hover:bg-purple-700',
    light: 'bg-purple-50 text-purple-800',
    ring: 'focus:ring-purple-500'
  },
  color: {
    primary: 'text-pink-600',
    bg: 'bg-pink-600 hover:bg-pink-700',
    light: 'bg-pink-50 text-pink-800',
    ring: 'focus:ring-pink-500'
  },
  accessory: {
    primary: 'text-green-600',
    bg: 'bg-green-600 hover:bg-green-700',
    light: 'bg-green-50 text-green-800',
    ring: 'focus:ring-green-500'
  },
  default: {
    primary: 'text-gray-600',
    bg: 'bg-gray-600 hover:bg-gray-700',
    light: 'bg-gray-50 text-gray-800',
    ring: 'focus:ring-gray-500'
  }
} as const

export const MODAL_SIZES = {
  sm: 'max-w-sm',    // 384px
  md: 'max-w-md',    // 448px  
  lg: 'max-w-lg',    // 512px
  xl: 'max-w-xl',    // 576px
  '2xl': 'max-w-2xl' // 672px
} as const

export const SPACING = {
  modal: {
    padding: 'p-4 sm:p-6',
    gap: 'space-y-4',
    header: 'p-4 sm:p-6',
    footer: 'p-4 sm:p-6'
  },
  form: {
    field: 'space-y-2',
    group: 'space-y-4',
    buttons: 'flex items-center justify-end gap-3'
  }
} as const

export const TRANSITIONS = {
  colors: 'transition-colors duration-200',
  all: 'transition-all duration-200',
  transform: 'transition-transform duration-200'
} as const

// Utilidades para obtener colores por tipo
export type ModalType = keyof typeof MODAL_COLORS
export const getModalColors = (type: ModalType = 'default') => MODAL_COLORS[type]