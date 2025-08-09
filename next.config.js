/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Configuração para módulos Node.js
    if (!isServer) {
      // Resolver módulos Node.js no cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
      };
    }
    
    return config;
  },
  // Configurações adicionais para melhor performance
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig 