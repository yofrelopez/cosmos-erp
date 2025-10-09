import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Solo permitir en desarrollo o con clave secreta
  const isDev = process.env.NODE_ENV === 'development'
  const debugKey = request.nextUrl.searchParams.get('key')
  
  if (!isDev && debugKey !== 'debug123') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***SET***' : 'NOT_SET',
    DATABASE_URL: process.env.DATABASE_URL ? '***SET***' : 'NOT_SET',
    DIRECT_URL: process.env.DIRECT_URL ? '***SET***' : 'NOT_SET',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : 'NOT_SET',
  }

  return NextResponse.json({
    message: 'Environment variables status',
    env: envVars,
    timestamp: new Date().toISOString()
  })
}