import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UsersList from '@/components/users/UsersList'
import PageHeader from '@/components/common/PageHeader'

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Solo Super Admin puede acceder a gestión de usuarios
  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/')
  }

  // Obtener todos los usuarios con información de empresa
  const users = await prisma.user.findMany({
    include: {
      company: {
        select: {
          id: true,
          name: true,
          ruc: true,
          status: true,
        }
      },
      _count: {
        select: {
          quotes: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  })

  // Obtener lista de empresas para el formulario
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      ruc: true,
      status: true,
    },
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      name: 'asc',
    }
  })

  return (
    <main className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestión de Usuarios"
          subtitle="Administra todos los usuarios del sistema"
          showBreadcrumb={true}
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Usuarios', href: '/usuarios' },
          ]}
        />

        <UsersList users={users} companies={companies} />
      </div>
    </main>
  )
}