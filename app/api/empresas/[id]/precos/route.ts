import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('Usando chave:', supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON_KEY')
    const { searchParams } = new URL(request.url)
    const tipoId = searchParams.get('tipo_servico_id')
    if (!tipoId) return NextResponse.json({ success: true, data: [] })

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('precos_tipos_empresa')
      .select('*')
      .eq('empresa_id', params.id)
      .eq('tipo_servico_id', tipoId)
      .order('vigente_desde', { ascending: false })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: data || [] })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('Usando chave:', supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON_KEY')
    const body = await request.json()
    const { tipo_servico_id, valor_unitario_decimal, fechar_anterior = true } = body || {}
    if (!tipo_servico_id || typeof valor_unitario_decimal !== 'number') {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios: tipo_servico_id, valor_unitario_decimal' }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (fechar_anterior) {
      await supabase
        .from('precos_tipos_empresa')
        .update({ vigente_ate: new Date().toISOString() })
        .is('vigente_ate', null)
        .eq('empresa_id', params.id)
        .eq('tipo_servico_id', tipo_servico_id)
    }

    const { data, error } = await supabase
      .from('precos_tipos_empresa')
      .insert([{ empresa_id: params.id, tipo_servico_id, valor_unitario_decimal, vigente_desde: new Date().toISOString() }])
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}


