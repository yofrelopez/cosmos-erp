import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Aquí puedes agregar lógica adicional de autorización por roles
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