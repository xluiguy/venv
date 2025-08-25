import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')

    if (!empresaId) {
      return NextResponse.json({ success: false, error: 'empresa_id é obrigatório' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('medicoes')
      .select('*')
      .eq('empresa_id', empresaId)

    if (dataInicio) {
      query = query.gte('data_medicao', dataInicio)
    }

    if (dataFim) {
      query = query.lte('data_medicao', dataFim)
    }

    const { data, error } = await query.order('data_medicao', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('medicoes')
      .insert([body])
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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('medicoes')
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
