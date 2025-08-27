import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = createSupabaseServerClient()

    // SQL para criar a tabela medicoes_salvas
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS medicoes_salvas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        data_inicio DATE,
        data_fim DATE,
        total_lancamentos INTEGER DEFAULT 0,
        total_clientes INTEGER DEFAULT 0,
        total_valor DECIMAL(10,2) DEFAULT 0,
        filtros_aplicados JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // SQL para habilitar RLS
    const enableRLSSQL = `
      ALTER TABLE medicoes_salvas ENABLE ROW LEVEL SECURITY;
    `

    // SQL para criar políticas
    const createPoliciesSQL = `
      CREATE POLICY IF NOT EXISTS "Allow all for anon" ON medicoes_salvas FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "Allow all for authenticated" ON medicoes_salvas FOR ALL USING (true);
    `

    // Executar as queries
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    if (createError) {
      console.error('Erro ao criar tabela:', createError)
      return NextResponse.json({ 
        success: false, 
        error: `Erro ao criar tabela: ${createError.message}` 
      }, { status: 500 })
    }

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL })
    if (rlsError) {
      console.warn('Aviso: não foi possível habilitar RLS:', rlsError.message)
    }

    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: createPoliciesSQL })
    if (policiesError) {
      console.warn('Aviso: não foi possível criar políticas:', policiesError.message)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tabela medicoes_salvas criada com sucesso!',
      instructions: `
        Se a função exec_sql não estiver disponível, execute manualmente no SQL Editor do Supabase:

        ${createTableSQL}
        ${enableRLSSQL}
        ${createPoliciesSQL}
      `
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
