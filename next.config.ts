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
  // SOLUCIÓN DEFINITIVA: Configuración mínima para Vercel + Next.js 15
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  outputFileTracing: {
    ignores: ['**/@prisma/engines/**'],
  },
  // Fix específico para el error ENOENT en Vercel
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
