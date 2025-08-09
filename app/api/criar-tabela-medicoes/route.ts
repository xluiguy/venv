import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fjyhxzjzobkuvwdqdtld.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeWh4emp6b2JrdXZ3ZHFkdGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTIzMDksImV4cCI6MjA2OTg4ODMwOX0.2GuNZxA4VGUkMPhfthzwn__AeWtGvCGkm1RB8NKbMVo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST() {
  try {
    console.log('🔨 Criando tabela medicoes_salvas...')
    
    // SQL para criar a tabela
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
      CREATE POLICY "Allow all for anon" ON medicoes_salvas FOR ALL USING (true);
    `

    // Executar as queries
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    if (createError) {
      console.error('❌ Erro ao criar tabela:', createError)
      return NextResponse.json({ 
        success: false, 
        error: createError.message 
      }, { status: 500 })
    }

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL })
    if (rlsError) {
      console.error('❌ Erro ao habilitar RLS:', rlsError)
    }

    const { error: policyError } = await supabase.rpc('exec_sql', { sql: createPoliciesSQL })
    if (policyError) {
      console.error('❌ Erro ao criar políticas:', policyError)
    }

    console.log('✅ Tabela medicoes_salvas criada com sucesso!')
    return NextResponse.json({ 
      success: true, 
      message: 'Tabela medicoes_salvas criada com sucesso!'
    })

  } catch (error) {
    console.error('💥 Erro geral:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
