import React from 'react'
import Link from 'next/link'
import MobileMenuButton from '@/components/ui/MobileMenuButton'

interface Breadcrumb {
  label: string
  href: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBreadcrumb?: boolean
  breadcrumbs?: Breadcrumb[]
  action?: React.ReactNode
  compact?: boolean
}

export default function PageHeader({
  title,
  subtitle,
  showBreadcrumb = false,
  breadcrumbs = [],
  action,
  compact = false,
}: PageHeaderProps) {
  return (
    <div className={`border-b border-gray-200 ${compact ? 'pb-3 sm:pb-4' : 'pb-5 sm:pb-6'}`}>
      {showBreadcrumb && breadcrumbs.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg
                    className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="m5.555 17.776 4-16 .894.448-4 16-.894-.448z" />
                  </svg>
                )}
                <Link
                  href={crumb.href}
                  className={`text-sm font-medium ${
                    index === breadcrumbs.length - 1
                      ? 'text-gray-500 cursor-default'
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <MobileMenuButton />
          <div>
            <h1 className={`${compact ? 'title-calculator' : 'title-page'} sm:truncate sm:tracking-tight`}>
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 subtitle-page">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {action && (
          <div className="mt-4 sm:mt-0 sm:ml-4">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}