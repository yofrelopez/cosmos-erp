// Debug endpoint para detectar problemas en PDF
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 PDF DEBUG: Starting debug session...')
    
    // 1. Extraer ID como lo hace el PDF real
    const id = Number(params.id)
    console.log('🔍 PDF DEBUG: ID from params:', id)
    console.log('🔍 PDF DEBUG: ID is valid number?', !isNaN(id))
    
    if (isNaN(id)) {
      console.log('❌ PDF DEBUG: Invalid ID')
      return NextResponse.json({ 
        error: 'Invalid ID', 
        debug: { id: params.id, parsed: id }
      }, { status: 400 })
    }

    // 2. Verificar qué métodos de prisma están disponibles
    console.log('🔍 PDF DEBUG: Available prisma keys:', Object.keys(prisma))
    console.log('🔍 PDF DEBUG: typeof prisma.quote:', typeof (prisma as any).quote)
    console.log('🔍 PDF DEBUG: typeof prisma.Quote:', typeof (prisma as any).Quote)
    console.log('🔍 PDF DEBUG: typeof prisma.client:', typeof (prisma as any).client)
    console.log('🔍 PDF DEBUG: typeof prisma.Client:', typeof (prisma as any).Client)

    const debugInfo: any = {
      id,
      prismaKeys: Object.keys(prisma),
      prismaQuoteLower: typeof (prisma as any).quote,
      prismaQuoteUpper: typeof (prisma as any).Quote,
      prismaClientLower: typeof (prisma as any).client,
      prismaClientUpper: typeof (prisma as any).Client,
    }

    // 3. Probar prisma.quote (minúsculas) - VERSIÓN ACTUAL DEL PDF
    console.log('🔍 PDF DEBUG: Testing prisma.quote (minúsculas)...')
    try {
      const quoteMinusculas = await (prisma as any).quote.findUniqueOrThrow({
        where: { id },
        include: { 
          client: true, 
          items: true,
          company: {
            include: {
              bankAccounts: true,
              wallets: true,
            }
          }
        },
      })
      console.log('✅ PDF DEBUG: prisma.quote FUNCIONA')
      debugInfo.quoteMinusculasSuccess = true
      debugInfo.quoteMinusculasData = {
        id: quoteMinusculas.id,
        code: quoteMinusculas.code,
        clientName: quoteMinusculas.client.fullName
      }
    } catch (err: any) {
      console.log('❌ PDF DEBUG: prisma.quote FALLA:', err.message)
      debugInfo.quoteMinusculasSuccess = false
      debugInfo.quoteMinusculasError = err.message
    }

    // 4. Probar prisma.Quote (mayúsculas) - VERSIÓN CORRECTA
    console.log('🔍 PDF DEBUG: Testing prisma.Quote (mayúsculas)...')
    try {
      const quoteMayusculas = await (prisma as any).Quote.findUniqueOrThrow({
        where: { id },
        include: { 
          client: true, 
          items: true,
          company: {
            include: {
              bankAccounts: true,
              wallets: true,
            }
          }
        },
      })
      console.log('✅ PDF DEBUG: prisma.Quote FUNCIONA')
      debugInfo.quoteMayusculasSuccess = true
      debugInfo.quoteMayusculasData = {
        id: quoteMayusculas.id,
        code: quoteMayusculas.code,
        clientName: quoteMayusculas.client.fullName
      }
    } catch (err: any) {
      console.log('❌ PDF DEBUG: prisma.Quote FALLA:', err.message)
      debugInfo.quoteMayusculasSuccess = false
      debugInfo.quoteMayusculasError = err.message
    }

    // 5. Verificar si existe la cotización con query directa
    console.log('🔍 PDF DEBUG: Checking if quote exists with direct query...')
    try {
      const directQuery = await prisma.$queryRaw`SELECT id, code FROM "Quote" WHERE id = ${id}`
      console.log('✅ PDF DEBUG: Direct query successful:', directQuery)
      debugInfo.directQuerySuccess = true
      debugInfo.directQueryData = directQuery
    } catch (err: any) {
      console.log('❌ PDF DEBUG: Direct query failed:', err.message)
      debugInfo.directQuerySuccess = false
      debugInfo.directQueryError = err.message
    }

    // 6. Resultado del debug
    console.log('🔍 PDF DEBUG: Debug completed')
    console.log('📊 PDF DEBUG Summary:', debugInfo)

    return NextResponse.json({
      success: true,
      message: 'Debug completed - check console for detailed logs',
      debug: debugInfo
    })

  } catch (error: any) {
    console.error('❌ PDF DEBUG: Unexpected error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}