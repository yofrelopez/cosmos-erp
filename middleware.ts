import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl
    
    // Redirigir página raíz (admin pages) si no es Super Admin
    if (pathname === "/" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/select-company", req.url))
    }
    
    // Permitir acceso a otras rutas admin solo para Super Admin
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
      authorized: ({ token }) => {
        // El usuario debe estar autenticado para acceder a rutas protegidas
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
     * - root page (/) - handled by client-side redirect
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo_|auth|^/$).*)',
  ],
}