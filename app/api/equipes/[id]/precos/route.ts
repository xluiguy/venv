import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const tipoId = searchParams.get('tipo_servico_id')
    if (!tipoId) return NextResponse.json({ success: true, data: [] })

    // TODO: Implementar quando a tabela precos_tipos_equipe for criada
    // Por enquanto, retornar dados vazios
    return NextResponse.json({ success: true, data: [] })

    /*
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('precos_tipos_equipe')
      .select('*')
      .eq('equipe_id', params.id)
      .eq('tipo_servico_id', tipoId)
      .order('vigente_desde', { ascending: false })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: data || [] })
    */
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}



