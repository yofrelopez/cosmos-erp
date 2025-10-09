import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const debugKey = request.nextUrl.searchParams.get('key')
  
  if (debugKey !== 'debug123') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  try {
    // Intentar una consulta simple
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection error:', error)
    
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}