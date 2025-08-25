import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const limit = Math.min(parseInt(searchParams.get('limit') || '7', 10), 7)
    const includeAll = searchParams.get('all') === '1'

    if (!q && !includeAll) return NextResponse.json({ success: true, data: [] })

    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('clientes')
      .select('id, nome, endereco, data_contrato')
      .ilike('nome', `%${q}%`)
      .limit(limit)

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: data || [] })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}


