// PaginationControls.tsx
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function PaginationControls({ page, total, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-6 text-sm">
      <button
        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer ${
            p === page ? 'bg-blue-600 text-white' : ''
          }`}
        >
          {p}
        </button>
      ))}

      <button
        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
