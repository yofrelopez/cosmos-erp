import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl
    
    // Redirigir página raíz según rol
    if (pathname === "/") {
      if (!token) {
        // No autenticado: ir a login
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      } else {
        // Todos los usuarios autenticados van al dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
    
    // Permitir acceso a rutas admin solo para Super Admin
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/select-company", req.url))
      }
    }
    
    // Rutas legacy admin también protegidas
    if (pathname.startsWith("/empresas") || 
        pathname.startsWith("/usuarios") || 
        pathname.startsWith("/precios")) {
      if (token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/select-company", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Permitir acceso sin autenticación a páginas públicas
        if (pathname.startsWith('/auth')) {
          return true
        }
        
        // El resto requiere autenticación
        return !!token
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth pages
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo_|auth).*)',
  ],
}