import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard'
import ClientProbe from '@/components/ClientProbe'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  // El middleware ya maneja la autorización, aquí solo renderizamos

  // Obtener estadísticas para Super Admin
  const stats = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.quote.count(),
    prisma.client.count(),
  ])

  const [totalCompanies, activeCompanies, totalUsers, activeUsers, totalQuotes, totalClients] = stats

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      ruc: true,
      logoUrl: true,
      status: true,
      _count: {
        select: {
          users: true,
          quotes: true,
          clients: true,
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <main className="p-6 space-y-6">
      <ClientProbe />
      <div className="max-w-7xl mx-auto">
        <SuperAdminDashboard 
          stats={{
            totalCompanies,
            activeCompanies,
            totalUsers,
            activeUsers,
            totalQuotes,
            totalClients,
          }}
          companies={companies}
        />
      </div>
    </main>
  )
}