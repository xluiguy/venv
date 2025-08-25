import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')
    const tipoServicoId = searchParams.get('tipo_servico_id')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')

    if (!empresaId) {
      return NextResponse.json({ success: false, error: 'empresa_id é obrigatório' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('precos')
      .select('*')
      .eq('empresa_id', empresaId)

    if (tipoServicoId) {
      query = query.eq('tipo_servico_id', tipoServicoId)
    }

    if (dataInicio) {
      query = query.gte('created_at', dataInicio)
    }

    if (dataFim) {
      query = query.lte('created_at', dataFim)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}


