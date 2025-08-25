import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('lancamentos')
      .select('data_contrato')
      .eq('cliente_id', params.id)
      .order('data_contrato', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // Se não encontrar, não é um erro, apenas não há dados
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: true, data: null })
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}
