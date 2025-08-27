import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET() {
  try {
    // Verificar variáveis de ambiente
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : undefined,
      SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE ? 
        `${process.env.SUPABASE_SERVICE_ROLE.substring(0, 20)}...` : undefined,
      NODE_ENV: process.env.NODE_ENV,
    }

    // Verificar configuração
    const configData = {
      supabase: {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey ? 
          `${config.supabase.anonKey.substring(0, 20)}...` : undefined,
        serviceRoleKey: config.supabase.serviceRoleKey ? 
          `${config.supabase.serviceRoleKey.substring(0, 20)}...` : undefined,
      },
      app: config.app,
    }

    // Verificar se as chaves são válidas
    const keyValidation = {
      urlValid: config.supabase.url && config.supabase.url.startsWith('https://'),
      anonKeyValid: config.supabase.anonKey && config.supabase.anonKey.startsWith('eyJ'),
      serviceRoleValid: config.supabase.serviceRoleKey && config.supabase.serviceRoleKey.startsWith('eyJ'),
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envVars,
      configData,
      keyValidation,
      message: 'Configurações verificadas com sucesso'
    })

  } catch (error) {
    console.error('Erro ao verificar configurações:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
      message: 'Erro ao verificar configurações'
    }, { status: 500 })
  }
}


