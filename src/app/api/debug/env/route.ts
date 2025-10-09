import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Solo permitir en desarrollo o con clave secreta
  const isDev = process.env.NODE_ENV === 'development'
  const debugKey = request.nextUrl.searchParams.get('key')
  
  if (!isDev && debugKey !== 'debug123') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  // Función para mostrar URL sin contraseña
  const maskUrl = (url: string | undefined) => {
    if (!url) return 'NOT_SET'
    // Reemplazar la contraseña con ***
    return url.replace(/:([^:@]+)@/, ':***@')
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***SET***' : 'NOT_SET',
    DATABASE_URL: maskUrl(process.env.DATABASE_URL),
    DIRECT_URL: maskUrl(process.env.DIRECT_URL),
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : 'NOT_SET',
    // Información adicional para debugging
    DATABASE_HOST: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'NOT_SET',
    DATABASE_PORT: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).port : 'NOT_SET',
    DIRECT_HOST: process.env.DIRECT_URL ? new URL(process.env.DIRECT_URL).hostname : 'NOT_SET',
    DIRECT_PORT: process.env.DIRECT_URL ? new URL(process.env.DIRECT_URL).port : 'NOT_SET',
  }

  return NextResponse.json({
    message: 'Environment variables status',
    env: envVars,
    timestamp: new Date().toISOString()
  })
}