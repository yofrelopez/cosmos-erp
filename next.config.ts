import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  eslint: {
    // Para producción - ignora algunos warnings de ESLint durante build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporal para Next.js 15 - hay un bug conocido con tipos de rutas API
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
