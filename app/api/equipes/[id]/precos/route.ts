import { NextResponse } from 'next/server'

const supabaseUrl = 'https://fjyhxzjzobkuvwdqdtld.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeWh4emp6b2JrdXZ3ZHFkdGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTIzMDksImV4cCI6MjA2OTg4ODMwOX0.2GuNZxA4VGUkMPhfthzwn__AeWtGvCGkm1RB8NKbMVo'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const equipeId = params.id
    const body = await request.json()
    const { valor_por_painel_decimal, valor_por_kwp_decimal, alterado_por } = body || {}

    if (valor_por_painel_decimal == null && valor_por_kwp_decimal == null) {
      return NextResponse.json({ success: false, error: 'Informe ao menos um preço' }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Obter valores anteriores
    const { data: equipeAtual } = await supabase
      .from('equipes')
      .select('valor_por_painel_decimal, valor_por_kwp_decimal')
      .eq('id', equipeId)
      .limit(1)

    const anteriorPainel = equipeAtual?.[0]?.valor_por_painel_decimal ?? null
    const anteriorKwp = equipeAtual?.[0]?.valor_por_kwp_decimal ?? null

    const updatePayload: any = {}
    if (valor_por_painel_decimal != null) updatePayload.valor_por_painel_decimal = valor_por_painel_decimal
    if (valor_por_kwp_decimal != null) updatePayload.valor_por_kwp_decimal = valor_por_kwp_decimal

    const { error: updErr } = await supabase
      .from('equipes')
      .update(updatePayload)
      .eq('id', equipeId)

    if (updErr) {
      return NextResponse.json({ success: false, error: updErr.message }, { status: 500 })
    }

    const historicos: any[] = []
    if (valor_por_painel_decimal != null && valor_por_painel_decimal !== anteriorPainel) {
      historicos.push({
        origem: 'equipe',
        origem_id: equipeId,
        campo: 'valor_por_painel_decimal',
        valor_anterior: anteriorPainel,
        valor_novo: valor_por_painel_decimal,
        alterado_por: alterado_por || 'api',
      })
    }
    if (valor_por_kwp_decimal != null && valor_por_kwp_decimal !== anteriorKwp) {
      historicos.push({
        origem: 'equipe',
        origem_id: equipeId,
        campo: 'valor_por_kwp_decimal',
        valor_anterior: anteriorKwp,
        valor_novo: valor_por_kwp_decimal,
        alterado_por: alterado_por || 'api',
      })
    }

    if (historicos.length > 0) {
      await supabase.from('historico_precos').insert(historicos)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}



