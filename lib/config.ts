// Configuração centralizada das variáveis de ambiente
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE!,
  },
  admin: {
    emails: process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || ['xavierluiguy@gmail.com'],
    defaultEmail: process.env.ADMIN_EMAIL || 'xavierluiguy@gmail.com',
    defaultPassword: process.env.ADMIN_PASSWORD || '1a2b3c4d',
  },
  app: {
    environment: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
} as const

// Validação das variáveis obrigatórias
export function validateConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE'
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}`)
  }
}

// Tipos para as configurações
export type Config = typeof config
export type SupabaseConfig = Config['supabase']
export type AdminConfig = Config['admin']
export type AppConfig = Config['app']
