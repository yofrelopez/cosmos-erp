'use client'

import Pagination from '../pagination/PaginationControls'

interface PaginatedTableProps {
  headers: string[]
  rows: React.ReactNode[]
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function PaginatedTable({
  headers,
  rows,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: PaginatedTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow">
      <table className="min-w-full text-sm text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-gray-700 font-semibold border-b text-sm"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center py-6 text-gray-500"
              >
                No se encontraron resultados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="px-4 py-4 border-t bg-gray-50 flex justify-center">
          <Pagination
            page={currentPage}
            total={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}
