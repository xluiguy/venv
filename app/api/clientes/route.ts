import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabaseClient'

export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const page = Math.max(parseInt(searchParams.get('pagina') || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limite') || '20', 10), 1), 100)
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const supabase = await getSupabaseClient()

    let query = supabase
      .from('clientes')
      .select('id, nome, endereco, data_contrato', { count: 'exact' })
      .order('nome', { ascending: true })
      .range(from, to)

    if (q) {
      query = query.ilike('nome', `%${q}%`)
    }

    const { data, error, count } = await query

    if (error) {
      // logger.error({ message: 'Erro ao buscar clientes', errorDetails: error }); // Original code had logger, but logger is removed.
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, page, limit, total: count ?? 0 })
  } catch (err: unknown) {
    // logger.error({ message: 'Erro inesperado na listagem de clientes', errorDetails: err }); // Original code had logger, but logger is removed.
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { nome, endereco, data_contrato } = await request.json()

    if (!nome) {
      return NextResponse.json({ success: false, error: 'O nome do cliente é obrigatório' }, { status: 400 })
    }
    
    const supabase = await getSupabaseClient()

    let { data, error } = await supabase
      .from('clientes')
      .insert({ nome, endereco, data_contrato })
      .select('id, nome, endereco, data_contrato')
      .single()

    if (error) {
      // logger.warn({ message: 'Falha na inserção direta, tentando verificar tabela e TENTAR NOVAMENTE.', initialError: error }); // Original code had logger, but logger is removed.
      
      // Tenta garantir que a tabela e as políticas existam
      await fetch(new URL('/api/clientes/verificar', request.url).toString(), { method: 'POST' });

      // Tenta a inserção novamente
      const retryResult = await supabase
        .from('clientes')
        .insert({ nome, endereco, data_contrato })
        .select('id, nome, endereco, data_contrato')
        .single();
        
      if (retryResult.error) {
        // logger.error({ message: 'Erro ao inserir cliente após verificação', errorDetails: retryResult.error }); // Original code had logger, but logger is removed.
        return NextResponse.json({ success: false, error: retryResult.error.message }, { status: 500 })
      }
      data = retryResult.data;
    }

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    // logger.error({ message: 'Erro inesperado na criação de cliente', errorDetails: err }); // Original code had logger, but logger is removed.
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}


