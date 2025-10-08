// app/(admin)/precios/page.tsx
import { redirect } from 'next/navigation'

// Redirigir a la primera sección por defecto
export default function PreciosPage() {
  redirect('/precios/vidrios')
}