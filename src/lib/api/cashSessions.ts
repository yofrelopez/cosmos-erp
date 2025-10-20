export interface CashSessionWithDetails {
  id: number
  companyId: number
  date: Date
  initialFund: number
  openedAt: Date
  closedAt: Date | null
  finalAmount: number | null
  isOpen: boolean
  notes: string | null
  openedById: string
  closedById: string | null
  openedBy: {
    id: string
    name: string | null
    username: string | null
  }
  closedBy?: {
    id: string
    name: string | null
    username: string | null
  }
  movements?: Array<{
    id: number
    type: 'INCOME' | 'EXPENSE'
    category: string
    paymentMethod?: string | null
    amount: number
    description: string
    date: Date
    createdAt: Date
    updatedAt: Date
    createdBy: {
      id: string
      name: string | null
      username: string | null
    }
  }>
  _count?: {
    movements: number
  }
}

export interface CashSessionsResponse {
  sessions: CashSessionWithDetails[]
}

export interface CreateCashSessionPayload {
  date: string
  initialFund: number
  notes?: string
}

export interface UpdateCashSessionPayload {
  finalAmount?: number
  notes?: string
  action: 'close' | 'reopen' | 'update'
}

// Obtener sesiones de caja
export async function fetchCashSessions(startDate?: string, endDate?: string): Promise<CashSessionsResponse> {
  const params = new URLSearchParams()
  
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)

  const url = params.toString() ? `/api/cash-sessions?${params}` : '/api/cash-sessions'
  const response = await fetch(url)
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch cash sessions')
  }

  const data = await response.json()
  
  // Convertir las fechas de string a Date objects
  return {
    sessions: data.sessions.map((session: any) => ({
      ...session,
      date: new Date(session.date),
      openedAt: new Date(session.openedAt),
      closedAt: session.closedAt ? new Date(session.closedAt) : null,
      movements: session.movements?.map((movement: any) => ({
        ...movement,
        date: new Date(movement.date),
        createdAt: new Date(movement.createdAt),
        updatedAt: new Date(movement.updatedAt)
      }))
    }))
  }
}

// Crear nueva sesión de caja
export async function createCashSession(payload: CreateCashSessionPayload): Promise<CashSessionWithDetails> {
  const response = await fetch('/api/cash-sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create cash session')
  }

  const data = await response.json()
  
  return {
    ...data.session,
    date: new Date(data.session.date),
    openedAt: new Date(data.session.openedAt),
    closedAt: data.session.closedAt ? new Date(data.session.closedAt) : null
  }
}

// Obtener sesión específica
export async function fetchCashSession(id: number): Promise<CashSessionWithDetails> {
  const response = await fetch(`/api/cash-sessions/${id}`)
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch cash session')
  }

  const data = await response.json()
  
  return {
    ...data.session,
    date: new Date(data.session.date),
    openedAt: new Date(data.session.openedAt),
    closedAt: data.session.closedAt ? new Date(data.session.closedAt) : null,
    movements: data.session.movements?.map((movement: any) => ({
      ...movement,
      date: new Date(movement.date),
      createdAt: new Date(movement.createdAt),
      updatedAt: new Date(movement.updatedAt)
    }))
  }
}

// Actualizar sesión (cerrar caja, reabrir, etc.)
export async function updateCashSession(id: number, payload: UpdateCashSessionPayload): Promise<CashSessionWithDetails> {
  const response = await fetch(`/api/cash-sessions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update cash session')
  }

  const data = await response.json()
  
  return {
    ...data.session,
    date: new Date(data.session.date),
    openedAt: new Date(data.session.openedAt),
    closedAt: data.session.closedAt ? new Date(data.session.closedAt) : null
  }
}

// Cerrar sesión de caja
export async function closeCashSession(id: number, finalAmount: number, notes?: string): Promise<CashSessionWithDetails> {
  return updateCashSession(id, {
    finalAmount,
    notes,
    action: 'close'
  })
}

// Reabrir sesión de caja
export async function reopenCashSession(id: number): Promise<CashSessionWithDetails> {
  return updateCashSession(id, {
    action: 'reopen'
  })
}