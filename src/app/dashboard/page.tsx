import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard'
import UserDashboard from '@/components/dashboard/UserDashboard'
import Sidebar from '@/components/ui/Sidebar'
import { SidebarProvider } from '@/contexts/SidebarContext'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Super Admin Dashboard
  if (session.user.role === 'SUPER_ADMIN') {
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
      <SidebarProvider>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <main className="ml-64 p-6 space-y-6">
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
        </div>
      </SidebarProvider>
    )
  }

  // Usuario Regular Dashboard
  // Obtener empresas del usuario
  const userCompanies = await prisma.company.findMany({
    where: {
      users: {
        some: {
          id: session.user.id
        }
      },
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      ruc: true,
      logoUrl: true,
      status: true,
      _count: {
        select: {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <UserDashboard 
          user={session.user}
          companies={userCompanies}
        />
      </div>
    </div>
  )
}