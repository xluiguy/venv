/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  transpilePackages: ['@supabase/supabase-js'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  // Configuração específica para Vercel
  output: 'standalone',
  // Otimizações para build
  swcMinify: true,
  // Configurações de imagens (se necessário)
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig