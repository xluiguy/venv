import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📝 Salvando medição - Dados recebidos:', body)
    
    const { nome, data_inicio, data_fim, total_lancamentos, total_clientes, total_valor, filtros_aplicados } = body

    // Validar dados obrigatórios
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      console.error('❌ Nome inválido:', nome)
      return NextResponse.json({ 
        success: false, 
        error: 'Nome da medição é obrigatório e deve ser uma string válida' 
      }, { status: 400 })
    }

    // Validar e limpar datas com logs detalhados
    let dataInicio = null
    let dataFim = null
    
    console.log('🔍 Debug - data_inicio recebida:', { 
      valor: data_inicio, 
      tipo: typeof data_inicio, 
      isString: typeof data_inicio === 'string',
      isNotEmpty: data_inicio && typeof data_inicio === 'string' && data_inicio.trim() !== ''
    })
    
    if (data_inicio && typeof data_inicio === 'string' && data_inicio.trim() !== '') {
      // Validar formato da data
      const dataInicioDate = new Date(data_inicio)
      if (isNaN(dataInicioDate.getTime())) {
        console.error('❌ Data de início inválida:', data_inicio)
        return NextResponse.json({ 
          success: false, 
          error: 'Data de início inválida' 
        }, { status: 400 })
      }
      dataInicio = data_inicio
      console.log('✅ Data de início válida:', dataInicio)
    } else {
      console.log('ℹ️ Data de início não fornecida ou vazia, definindo como null')
    }
    
    console.log('🔍 Debug - data_fim recebida:', { 
      valor: data_fim, 
      tipo: typeof data_fim, 
      isString: typeof data_fim === 'string',
      isNotEmpty: data_fim && typeof data_fim === 'string' && data_fim.trim() !== ''
    })
    
    if (data_fim && typeof data_fim === 'string' && data_fim.trim() !== '') {
      // Validar formato da data
      const dataFimDate = new Date(data_fim)
      if (isNaN(dataFimDate.getTime())) {
        console.error('❌ Data de fim inválida:', data_fim)
        return NextResponse.json({ 
          success: false, 
          error: 'Data de fim inválida' 
        }, { status: 400 })
      }
      dataFim = data_fim
      console.log('✅ Data de fim válida:', dataFim)
    } else {
      console.log('ℹ️ Data de fim não fornecida ou vazia, definindo como null')
    }

    // Validar valores numéricos
    const lancamentos = parseInt(total_lancamentos) || 0
    const clientes = parseInt(total_clientes) || 0
    const valor = parseFloat(total_valor) || 0

    // Preparar dados para inserção
    const dadosMedicao = {
      nome: nome.trim(),
      data_inicio: dataInicio,
      data_fim: dataFim,
      total_lancamentos: lancamentos,
      total_clientes: clientes,
      total_valor: valor,
      filtros_aplicados: filtros_aplicados || { equipes: [], cliente: '' }
    }

    console.log('📊 Dados finais preparados para inserção:', dadosMedicao)
    console.log('🔍 Verificação final - data_inicio:', { 
      valor: dadosMedicao.data_inicio, 
      tipo: typeof dadosMedicao.data_inicio,
      isNull: dadosMedicao.data_inicio === null
    })
    console.log('🔍 Verificação final - data_fim:', { 
      valor: dadosMedicao.data_fim, 
      tipo: typeof dadosMedicao.data_fim,
      isNull: dadosMedicao.data_fim === null
    })

    // Inserir na tabela medicoes_salvas
    const supabase = createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('medicoes_salvas')
      .insert([dadosMedicao])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao inserir medição:', error)
      return NextResponse.json({ 
        success: false, 
        error: `Erro ao salvar medição: ${error.message}` 
      }, { status: 500 })
    }

    console.log('✅ Medição salva com sucesso:', data)
    return NextResponse.json({ 
      success: true, 
      message: 'Medição salva com sucesso!',
      data: data
    })

  } catch (error) {
    console.error('💥 Erro geral:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
