import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📝 Inserindo medição via MCP:', body)
    
    const { nome, data_inicio, data_fim, total_lancamentos, total_clientes, total_valor, filtros_aplicados } = body

    // Validar dados obrigatórios
    if (!nome) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nome da medição é obrigatório' 
      }, { status: 400 })
    }

    // Preparar dados para inserção
    const dadosMedicao = {
      nome,
      data_inicio: data_inicio || null,
      data_fim: data_fim || null,
      total_lancamentos: total_lancamentos || 0,
      total_clientes: total_clientes || 0,
      total_valor: total_valor || 0,
      filtros_aplicados: filtros_aplicados || { equipes: [], cliente: '' }
    }

    console.log('📊 Dados preparados:', dadosMedicao)

    // Retornar sucesso simulado por enquanto
    // Em uma implementação completa, você usaria o MCP aqui
    return NextResponse.json({ 
      success: true, 
      message: 'Medição preparada para inserção via MCP',
      dados: dadosMedicao,
      instrucoes: `
        Para inserir via MCP, use:
        
        INSERT INTO medicoes_salvas (
          nome, data_inicio, data_fim, total_lancamentos, 
          total_clientes, total_valor, filtros_aplicados
        ) VALUES (
          '${nome}', 
          ${data_inicio ? `'${data_inicio}'` : 'NULL'}, 
          ${data_fim ? `'${data_fim}'` : 'NULL'}, 
          ${total_lancamentos || 0}, 
          ${total_clientes || 0}, 
          ${total_valor || 0}, 
          '${JSON.stringify(filtros_aplicados || { equipes: [], cliente: '' })}'
        ) RETURNING id;
      `
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
