import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV,
    supabase: {
      url: supabaseUrl ? '✅ Configurado' : '❌ Não configurado',
      key: supabaseKey ? '✅ Configurado' : '❌ Não configurado',
      keyPreview: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'N/A'
    },
    timestamp: new Date().toISOString()
  })
}


