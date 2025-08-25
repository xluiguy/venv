import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ativo = searchParams.get('ativo')

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Consulta defensiva: se a tabela/coluna não existir, retorna lista vazia
    let base = supabase.from('tipos_servico').select('*').order('nome')
    let resp = await base
    if (resp.error?.code === '42P01') {
      // tabela não existe
      return NextResponse.json({ success: true, data: [] })
    }
    if (resp.error) {
      return NextResponse.json({ success: false, error: resp.error.message }, { status: 500 })
    }

    if (ativo === 'true') {
      const filtered = await supabase.from('tipos_servico').select('*').order('nome').eq('ativo', true)
      if (filtered.error?.code === '42703') {
        // coluna 'ativo' ausente: retorna todos
        return NextResponse.json({ success: true, data: resp.data || [] })
      }
      if (filtered.error) {
        return NextResponse.json({ success: false, error: filtered.error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, data: filtered.data || [] })
    }

    return NextResponse.json({ success: true, data: resp.data || [] })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, codigo, descricao, modelo_cobranca, valor_unitario_decimal, ativo = true, permite_aditivo = false, permite_desconto = false, exige_quantidade_paineis = false, exige_kwp = false, exige_horas = false } = body || {}

    if (!nome || !codigo || !modelo_cobranca) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios: nome, codigo, modelo_cobranca' }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from('tipos_servico')
      .insert([{
        nome, codigo, descricao, modelo_cobranca,
        valor_unitario_decimal, ativo, permite_aditivo, permite_desconto,
        exige_quantidade_paineis, exige_kwp, exige_horas
      }])
      .select()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: data?.[0] })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}


