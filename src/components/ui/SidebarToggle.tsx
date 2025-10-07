import { Menu, X } from 'lucide-react'

interface SidebarToggleProps {
  isCollapsed: boolean
  isMobile: boolean
  onToggle: () => void
}

export default function SidebarToggle({ isCollapsed, isMobile, onToggle }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
        isMobile 
          ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600'
      }`}
      aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
    >
      {isMobile && !isCollapsed ? (
        <X size={20} className="transition-transform duration-300" />
      ) : (
        <Menu size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      )}
    </button>
  )
}