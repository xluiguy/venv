import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    // Lista de tabelas que queremos verificar (tipos específicos do Supabase)
    const tabelasParaVerificar = [
      'empresas',
      'clientes', 
      'equipes',
      'tipos_servico',
      'lancamentos',
      'medicoes_salvas',
      'configuracoes_precos',
      'historico_precos',
      'precos_tipos_empresa'
    ] as const

    const resultados: Record<string, { exists: boolean; error: string | null }> = {}

    // Verificar cada tabela individualmente
    for (const tabela of tabelasParaVerificar) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1)

        if (error) {
          if (error.code === '42P01') {
            resultados[tabela] = { exists: false, error: 'Tabela não existe' }
          } else {
            resultados[tabela] = { exists: true, error: error.message }
          }
        } else {
          resultados[tabela] = { exists: true, error: null }
        }
      } catch (err) {
        resultados[tabela] = { exists: false, error: 'Erro ao verificar' }
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        tables: resultados
      } 
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}
