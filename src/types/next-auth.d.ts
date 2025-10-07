import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      companyId: number | null
      companyName?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    companyId: number | null
    companyName?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    companyId: number | null
    companyName?: string
  }
}