import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    console.log('🔍 Testando tabela medicoes_salvas...')
    
    const supabase = createSupabaseServerClient()

    // 1. Tentar buscar dados da tabela
    const { data: medicoes, error: selectError } = await supabase
      .from('medicoes_salvas')
      .select('*')
      .limit(1)

    if (selectError) {
      console.error('❌ Erro ao buscar da tabela:', selectError)
      
      // Se der erro, provavelmente a tabela não existe
      if (selectError.code === '42P01') {
        return NextResponse.json({ 
          success: false, 
          error: 'Tabela medicoes_salvas não existe',
          solution: `
            Execute o seguinte SQL no SQL Editor do Supabase:
            
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
            
            ALTER TABLE medicoes_salvas ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Allow all for anon" ON medicoes_salvas FOR ALL USING (true);
            CREATE POLICY "Allow all for authenticated" ON medicoes_salvas FOR ALL USING (true);
          `
        }, { status: 404 })
      }

      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao acessar tabela',
        details: selectError.message,
        solution: 'Verifique as políticas RLS e permissões da tabela'
      }, { status: 500 })
    }

    // 2. Se chegou até aqui, a tabela existe e está funcionando
    console.log('✅ Tabela medicoes_salvas está funcionando')
    
    // 3. Tentar inserir uma medição de teste
    const mediacaoTeste = {
      nome: 'Medição de Teste - ' + new Date().toISOString(),
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: new Date().toISOString().split('T')[0],
      total_lancamentos: 0,
      total_clientes: 0,
      total_valor: 0,
      filtros_aplicados: { equipes: [], cliente: '' }
    }

    const { data: insertData, error: insertError } = await supabase
      .from('medicoes_salvas')
      .insert([mediacaoTeste])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao inserir medição de teste:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Tabela existe mas não é possível inserir dados',
        details: insertError.message,
        solution: 'Verifique as permissões de inserção e a estrutura da tabela'
      }, { status: 500 })
    }

    // 4. Se chegou até aqui, tudo está funcionando
    console.log('✅ Inserção de teste funcionou:', insertData)
    
    // 5. Remover a medição de teste
    const { error: deleteError } = await supabase
      .from('medicoes_salvas')
      .delete()
      .eq('id', insertData.id)

    if (deleteError) {
      console.warn('⚠️ Não foi possível remover medição de teste:', deleteError.message)
    } else {
      console.log('✅ Medição de teste removida com sucesso')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tabela medicoes_salvas está funcionando perfeitamente!',
      testResult: {
        tableExists: true,
        canSelect: true,
        canInsert: true,
        canDelete: !deleteError,
        totalMedicoes: medicoes?.length || 0,
        tableStructure: 'OK',
        permissions: 'OK'
      },
      nextSteps: [
        'A tabela está funcionando corretamente',
        'Você pode agora salvar medições',
        'Teste clicando em "Nova Medição" na página'
      ]
    })

  } catch (error) {
    console.error('💥 Erro geral no teste:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      solution: 'Verifique os logs do servidor e tente novamente'
    }, { status: 500 })
  }
}
