/**
 * API Route Helpers para Next.js 15
 * Manejo centralizado de parámetros dinámicos y validación
 */

/**
 * Custom error class para errores de ID inválido
 * Permite distinguir errores de validación (400) de errores de servidor (500)
 */
export class InvalidIdError extends Error {
  constructor(id: string) {
    super(`Invalid ID parameter: "${id}". Expected a positive integer.`);
    this.name = 'InvalidIdError';
  }
}

/**
 * Parsea y valida el parámetro ID de una ruta dinámica [id]
 * En Next.js 15, params es una Promise que debe ser awaited
 * 
 * @param params - Promise o objeto con parámetro id
 * @returns ID numérico validado
 * @throws InvalidIdError si el ID es inválido (NaN, negativo o cero)
 * 
 * @example
 * export async function PUT(req: NextRequest, { params }: RouteContext) {
 *   try {
 *     const id = await parseRouteId(params);
 *     // id es number válido (> 0)
 *   } catch (error) {
 *     if (error instanceof InvalidIdError) {
 *       return NextResponse.json({ message: error.message }, { status: 400 });
 *     }
 *     throw error; // Re-lanzar otros errores
 *   }
 * }
 */
export async function parseRouteId(
  params: Promise<{ id: string }> | { id: string }
): Promise<number> {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  
  if (isNaN(numericId) || numericId <= 0) {
    throw new InvalidIdError(id);
  }
  
  return numericId;
}
