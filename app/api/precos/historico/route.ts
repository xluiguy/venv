import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = (process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { origem, origem_id, campo, valor_anterior, valor_novo, alterado_por } = body || {}

    if (!origem || !campo) {
      return NextResponse.json({ success: false, error: 'origem e campo são obrigatórios' }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { error } = await supabase.from('historico_precos').insert([
      {
        origem,
        origem_id: origem_id || null,
        campo,
        valor_anterior: valor_anterior ?? null,
        valor_novo: valor_novo ?? null,
        alterado_por: alterado_por || 'ui',
      },
    ])

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}


