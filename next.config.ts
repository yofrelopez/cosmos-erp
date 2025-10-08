import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // SOLUCIÓN DEFINITIVA para ENOENT client-reference-manifest en Vercel
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Optimización crítica para barrel exports (index.ts files)
  optimizePackageImports: ['@/lib', '@/components', '@/types', '@/schemas'],
  
  // Configuración específica para Vercel build
  outputFileTracing: {
    ignores: ['**/@prisma/engines/**'],
  },
};

export default nextConfig;
