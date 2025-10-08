import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { useSidebar } from '@/contexts/SidebarContext'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: string | number
  shortcut?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface NavGroupProps {
  group: NavGroup
  isCollapsed: boolean
}

export default function NavGroup({ group, isCollapsed }: NavGroupProps) {
  const pathname = usePathname()
  const { isMobile, toggle } = useSidebar()

  const handleLinkClick = () => {
    // En móvil, cerrar el sidebar automáticamente al hacer clic en un enlace
    if (isMobile) {
      toggle()
    }
  }

  if (isCollapsed) {
    // Modo colapsado - solo iconos optimizado
    return (
      <div className="space-y-2 px-1 overflow-hidden">
        {group.items.map(({ href, label, icon: Icon, badge, shortcut }) => {
          const active = pathname.startsWith(href)
          return (
            <div key={href} className="group relative">
              <Link
                href={href}
                onClick={handleLinkClick}
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:scale-105 mx-auto ${
                  active 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Icon size={16} />
                {badge && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                    {typeof badge === 'string' && badge.length > 1 ? '•' : badge}
                  </div>
                )}
              </Link>
              
              {/* Tooltip mejorado */}
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 top-1/2 -translate-y-1/2 shadow-lg">
                <div className="font-medium">{label}</div>
                {shortcut && (
                  <div className="text-gray-300 text-[10px] mt-1">{shortcut}</div>
                )}
                {/* Flecha del tooltip */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Modo expandido
  return (
    <div className="space-y-2">
      <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {group.label}
      </h3>
      <div className="space-y-1">
        {group.items.map(({ href, label, icon: Icon, badge, shortcut }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-4 py-3 mx-2 rounded-lg transition-all duration-200 group ${
                active 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={`transition-all duration-200 ${active ? 'text-blue-600' : 'group-hover:scale-105'}`} />
                <span className="font-medium text-sm">{label}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {badge && (
                  <div className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    active 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {badge}
                  </div>
                )}
                {shortcut && !active && (
                  <span className="text-xs text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {shortcut}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}