import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📝 Salvando medição via MCP funcional:', body)
    
    const { nome, data_inicio, data_fim, total_lancamentos, total_clientes, total_valor, filtros_aplicados } = body

    // Validar dados obrigatórios
    if (!nome) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nome da medição é obrigatório' 
      }, { status: 400 })
    }

    // Tentar salvar via Supabase diretamente no endpoint
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = 'https://fjyhxzjzobkuvwdqdtld.supabase.co'
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeWh4emp6b2JrdXZ3ZHFkdGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTIzMDksImV4cCI6MjA2OTg4ODMwOX0.2GuNZxA4VGUkMPhfthzwn__AeWtGvCGkm1RB8NKbMVo'
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      const dadosMedicao = {
        nome,
        data_inicio: data_inicio || null,
        data_fim: data_fim || null,
        total_lancamentos: total_lancamentos || 0,
        total_clientes: total_clientes || 0,
        total_valor: total_valor || 0,
        filtros_aplicados: filtros_aplicados || { equipes: [], cliente: '' }
      }

      console.log('📊 Inserindo dados:', dadosMedicao)

      const { data, error } = await supabase
        .from('medicoes_salvas')
        .insert([dadosMedicao])
        .select()

      if (error) {
        console.error('❌ Erro ao inserir via Supabase no endpoint:', error)
        return NextResponse.json({ 
          success: false, 
          error: error.message,
          details: error
        }, { status: 500 })
      }

      console.log('✅ Medição salva com sucesso via endpoint:', data)
      return NextResponse.json({ 
        success: true, 
        message: 'Medição salva com sucesso!',
        data: data[0]
      })

    } catch (supabaseError) {
      console.error('❌ Erro no Supabase do endpoint:', supabaseError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao conectar com banco de dados',
        details: supabaseError instanceof Error ? supabaseError.message : 'Erro desconhecido'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('💥 Erro geral no endpoint:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
