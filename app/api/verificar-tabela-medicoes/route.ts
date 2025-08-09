import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fjyhxzjzobkuvwdqdtld.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeWh4emp6b2JrdXZ3ZHFkdGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTIzMDksImV4cCI6MjA2OTg4ODMwOX0.2GuNZxA4VGUkMPhfthzwn__AeWtGvCGkm1RB8NKbMVo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    console.log('🔍 Verificando dados da tabela medicoes_salvas...')
    
    // Tentar fazer uma consulta completa
    const { data, error } = await supabase
      .from('medicoes_salvas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao verificar tabela:', error)
      return NextResponse.json({ 
        exists: false, 
        error: error.message,
        code: error.code 
      })
    }

    console.log('✅ Tabela existe! Dados encontrados:', data?.length || 0)
    return NextResponse.json({ 
      exists: true, 
      message: `Tabela medicoes_salvas existe e tem ${data?.length || 0} registros`,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('💥 Erro geral:', error)
    return NextResponse.json({ 
      exists: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
