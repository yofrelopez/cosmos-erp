
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log('🔍 Session status:', status)
    console.log('👤 Session data:', session)
    
    if (status === 'loading') return // Aún cargando

    if (session) {
      // Todos los usuarios van a su dashboard personal
      console.log('✅ Usuario autenticado, redirigiendo a dashboard')
      router.push('/dashboard')
    } else {
      // Usuario no autenticado, redirigir al login
      console.log('❌ Usuario no autenticado, redirigiendo a /auth/signin')
      router.push('/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo_2.png"
              alt="ERP Cosmos Logo"
              width={80}
              height={80}
              className="object-contain rounded-lg bg-white p-2 shadow-sm border border-gray-200"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ERP COSMOS</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return null // Esta página no se muestra, siempre redirige
}
