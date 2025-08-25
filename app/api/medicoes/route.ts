import { NextResponse } from 'next/server'

const supabaseUrl = 'https://fjyhxzjzobkuvwdqdtld.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeWh4emp6b2JrdXZ3ZHFkdGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTIzMDksImV4cCI6MjA2OTg4ODMwOX0.2GuNZxA4VGUkMPhfthzwn__AeWtGvCGkm1RB8NKbMVo'


export async function GET() {
  try {
    console.log('🔍 API: Iniciando carregamento de medições...')
    console.log('🔄 API: Timestamp atual:', new Date().toISOString())

    // Tentar via cliente Supabase
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      // Forçar bypass total do cache com timestamp
      const timestamp = Date.now()
      const { data, error } = await supabase
        .from('medicoes_salvas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (error) {
        console.error('❌ API: Erro no Supabase client:', error)
        
        // Se a tabela não existe, retornar array vazio
        if (error.code === '42P01') {
          console.log('⚠️ API: Tabela não existe')
          return NextResponse.json({ 
            success: true, 
            medicoes: [],
            message: 'Tabela não existe'
          })
        }
        
        return NextResponse.json({ 
          success: false, 
          error: error.message,
          code: error.code 
        }, { status: 500 })
      }

      console.log('🔍 API: Resultado da consulta:', { data: data?.length || 0, error: null })
      
      if (data && Array.isArray(data)) {
        console.log(`✅ API: Medições carregadas: ${data.length} registros`)
        if (data.length > 0) {
          console.log('📊 API: Dados detalhados:', data.map(m => ({
            id: m.id?.substring(0, 8) + '...',
            nome: m.nome,
            valor: m.total_valor,
            created_at: m.created_at
          })))
        }
        return NextResponse.json({ success: true, medicoes: data })
      }

      // Se não há dados, retornar array vazio
      return NextResponse.json({ success: true, medicoes: [] })

    } catch (supabaseError) {
      console.error('❌ API: Erro ao conectar com Supabase:', supabaseError)
      
      // Retornar array vazio em caso de erro
      return NextResponse.json({ 
        success: true, 
        medicoes: [],
        message: 'Erro de conexão'
      })
    }
    
  } catch (error) {
    console.error('❌ API: Erro geral:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const medicaoId = searchParams.get('id')

    if (!medicaoId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID da medição é obrigatório' 
      }, { status: 400 })
    }

    console.log('🗑️ API: Tentando deletar medição:', medicaoId)

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { error } = await supabase
      .from('medicoes_salvas')
      .delete()
      .eq('id', medicaoId)

    if (error) {
      console.error('❌ API: Erro ao deletar:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    console.log('✅ API: Medição deletada com sucesso')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ API: Erro geral no DELETE:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📝 Salvando medição via API principal:', body)
    
    const { nome, data_inicio, data_fim, total_lancamentos, total_clientes, total_valor, filtros_aplicados } = body

    if (!nome) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nome da medição é obrigatório' 
      }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
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
      console.error('❌ Erro ao inserir via Supabase:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
      }, { status: 500 })
    }

    console.log('✅ Medição salva com sucesso:', data)
    return NextResponse.json({ 
      success: true, 
      data: data[0]
    })

  } catch (error) {
    console.error('💥 Erro geral no POST:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
    }, { status: 500 })
  }
}
