import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')

    console.log('🔍 GET /api/medicoes - Parâmetros:', { empresaId, dataInicio, dataFim })

    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('medicoes_salvas')
      .select('*')

    // Aplicar filtros apenas se fornecidos e válidos
    if (empresaId && empresaId.trim() !== '') {
      query = query.eq('empresa_id', empresaId)
      console.log('✅ Filtro empresa_id aplicado:', empresaId)
    }

    if (dataInicio && dataInicio.trim() !== '') {
      // Validar formato da data
      const dataInicioDate = new Date(dataInicio)
      if (!isNaN(dataInicioDate.getTime())) {
        query = query.gte('data_inicio', dataInicio)
        console.log('✅ Filtro data_inicio aplicado:', dataInicio)
      } else {
        console.warn('⚠️ Data de início inválida ignorada:', dataInicio)
      }
    }

    if (dataFim && dataFim.trim() !== '') {
      // Validar formato da data
      const dataFimDate = new Date(dataFim)
      if (!isNaN(dataFimDate.getTime())) {
        query = query.lte('data_fim', dataFim)
        console.log('✅ Filtro data_fim aplicado:', dataFim)
      } else {
        console.warn('⚠️ Data de fim inválida ignorada:', dataFim)
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar medições:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log(`✅ ${data?.length || 0} medições encontradas`)
    return NextResponse.json({ success: true, data: data || [] })
  } catch (err) {
    console.error('💥 Erro geral na API de medições:', err)
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📝 Salvando medição via API /medicoes:', body)
    
    // Validar dados antes de enviar para o Supabase
    const { nome, data_inicio, data_fim, total_lancamentos, total_clientes, total_valor, filtros_aplicados } = body

    // Validar nome
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      console.error('❌ Nome inválido na API /medicoes:', nome)
      return NextResponse.json({ 
        success: false, 
        error: 'Nome da medição é obrigatório' 
      }, { status: 400 })
    }

    // Validar e limpar datas
    let dataInicio = null
    let dataFim = null
    
    if (data_inicio && typeof data_inicio === 'string' && data_inicio.trim() !== '') {
      const dataInicioDate = new Date(data_inicio)
      if (!isNaN(dataInicioDate.getTime())) {
        dataInicio = data_inicio
        console.log('✅ Data de início válida na API /medicoes:', dataInicio)
      } else {
        console.warn('⚠️ Data de início inválida na API /medicoes, definindo como null:', data_inicio)
      }
    }
    
    if (data_fim && typeof data_fim === 'string' && data_fim.trim() !== '') {
      const dataFimDate = new Date(data_fim)
      if (!isNaN(dataFimDate.getTime())) {
        dataFim = data_fim
        console.log('✅ Data de fim válida na API /medicoes:', dataFim)
      } else {
        console.warn('⚠️ Data de fim inválida na API /medicoes, definindo como null:', data_fim)
      }
    }

    // Preparar dados limpos
    const dadosLimpos = {
      nome: nome.trim(),
      data_inicio: dataInicio,
      data_fim: dataFim,
      total_lancamentos: parseInt(total_lancamentos) || 0,
      total_clientes: parseInt(total_clientes) || 0,
      total_valor: parseFloat(total_valor) || 0,
      filtros_aplicados: filtros_aplicados || { equipes: [], cliente: '' }
    }

    console.log('📊 Dados limpos para inserção na API /medicoes:', dadosLimpos)
    
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('medicoes_salvas')
      .insert([dadosLimpos])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao inserir medição na API /medicoes:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('✅ Medição salva com sucesso na API /medicoes:', data)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('💥 Erro geral ao salvar medição na API /medicoes:', err)
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('medicoes_salvas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const { error } = await supabase
      .from('medicoes_salvas')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Medição excluída com sucesso' })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}
