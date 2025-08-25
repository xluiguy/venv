import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('clientes')
      .select('data_contrato')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        ultimaDataContrato: data?.data_contrato || null 
      } 
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}
