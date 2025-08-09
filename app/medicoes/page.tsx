'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Download,
  Calendar,
  Users,
  DollarSign,
  Trash2,
  AlertTriangle,
  Database,
  Wrench,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

interface MedicaoSalva {
  id: string
  nome: string
  data_inicio: string
  data_fim: string
  total_lancamentos: number
  total_clientes: number
  total_valor: number
  filtros_aplicados: {
    equipes: string[]
    cliente: string
  }
  created_at: string
}

export default function MedicoesPage() {
  const [medicoes, setMedicoes] = useState<MedicaoSalva[]>([])
  const [loading, setLoading] = useState(false)
  const [tabelaNaoExiste, setTabelaNaoExiste] = useState(false)
  const [criandoTabela, setCriandoTabela] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  useEffect(() => {
    carregarMedicoes()
  }, [])

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  const carregarMedicoes = async () => {
    setLoading(true)
    setTabelaNaoExiste(false)
    setDebugInfo([])
    
    try {
      addDebugInfo('🔍 Iniciando carregamento de medições...')
      
      // 1) Primeiro, tentar via API interna
      try {
        addDebugInfo('📡 Tentando via API interna...')
        const response = await fetch('/api/medicoes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.medicoes) {
            addDebugInfo(`✅ API interna: ${result.medicoes.length} medições encontradas`)
            setMedicoes(result.medicoes)
            toast.success(`Medições carregadas: ${result.medicoes.length} encontradas`)
            return
          } else {
            addDebugInfo(`⚠️ API interna retornou erro: ${result.error}`)
          }
        } else {
          addDebugInfo(`⚠️ API interna retornou status: ${response.status}`)
        }
      } catch (apiError) {
        addDebugInfo(`❌ Erro na API interna: ${apiError}`)
      }

      // 2) Tentar via PostgREST diretamente
      const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeWh4emp6b2JrdXZ3ZHFkdGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTIzMDksImV4cCI6MjA2OTg4ODMwOX0.2GuNZxA4VGUkMPhfthzwn__AeWtGvCGkm1RB8NKbMVo'

      const tryRest = async (path: string) => {
        try {
          const url = `https://fjyhxzjzobkuvwdqdtld.supabase.co/rest/v1/${path}`
          addDebugInfo(`🌐 Tentando REST: ${path}`)
          
          const res = await fetch(url, {
            method: path.startsWith('rpc/') ? 'POST' : 'GET',
            headers: {
              apikey: API_KEY,
              Authorization: `Bearer ${API_KEY}`,
              Accept: 'application/json',
              'Accept-Profile': 'public',
              'Content-Type': 'application/json'
            },
            cache: 'no-store',
            body: path.startsWith('rpc/') ? '{}' : undefined
          })
          
          if (!res.ok) {
            addDebugInfo(`❌ REST ${path} falhou: ${res.status} ${res.statusText}`)
            return null
          }
          
          const restData = await res.json()
          addDebugInfo(`✅ REST ${path} sucesso: ${restData?.length || 0} registros`)
          return restData
        } catch (error) {
          addDebugInfo(`❌ Erro no REST ${path}: ${error}`)
          return null
        }
      }

      // Tentar apenas a tabela diretamente (sem fallbacks que podem retornar dados de teste)
      let restResult = await tryRest('medicoes_salvas?select=*&order=created_at.desc')
      
      if (restResult && Array.isArray(restResult) && restResult.length > 0) {
        addDebugInfo(`✅ Medições carregadas via REST: ${restResult.length}`)
        setMedicoes(restResult)
        toast.success(`Medições carregadas: ${restResult.length} encontradas`)
        return
      }

      // 3) Fallback: tentar via cliente Supabase
      addDebugInfo('⚠️ REST falhou, tentando via cliente Supabase...')
      const supabase = getSupabaseClient()
      const { data: supaData, error } = await supabase
        .from('medicoes_salvas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === '42P01') {
          addDebugInfo('❌ Tabela medicoes_salvas não existe ainda.')
          setTabelaNaoExiste(true)
          setMedicoes([])
          return
        }
        addDebugInfo(`❌ Erro no Supabase client: ${error.message}`)
        throw error
      }

      if (supaData && Array.isArray(supaData)) {
        addDebugInfo(`✅ Medições carregadas via Supabase client: ${supaData.length}`)
        setMedicoes(supaData)
        toast.success(`Medições carregadas: ${supaData.length} encontradas`)
        return
      }

      // 4) Se chegou até aqui, não há dados
      addDebugInfo('ℹ️ Nenhuma medição encontrada - sistema limpo')
      setMedicoes([])
      toast.success('Sistema carregado - nenhuma medição salva encontrada')
      
    } catch (error) {
      addDebugInfo(`❌ Erro ao carregar medições: ${error}`)
      toast.error('Erro ao carregar medições')
      setMedicoes([])
    } finally {
      setLoading(false)
    }
  }

  const criarTabelaMedicoes = async () => {
    setCriandoTabela(true)
    try {
      const response = await fetch('/api/criar-tabela-medicoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        const instrucoes = `
Para criar a tabela medicoes_salvas, execute o seguinte SQL no painel do Supabase:

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

-- Habilitar RLS
ALTER TABLE medicoes_salvas ENABLE ROW LEVEL SECURITY;

-- Criar políticas para anon
CREATE POLICY "Allow all for anon" ON medicoes_salvas FOR ALL USING (true);

Passos:
1. Acesse o painel do Supabase
2. Vá para SQL Editor
3. Cole o código acima
4. Execute a query
5. Volte para esta página e recarregue
        `
        
        alert('Instruções para criar a tabela:\n\n' + instrucoes)
        toast.success('Verifique as instruções no alerta')
      } else {
        toast.error(`Erro: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao criar tabela:', error)
      toast.error('Erro ao criar tabela')
    } finally {
      setCriandoTabela(false)
    }
  }

  const exportarMedicao = async (medicao: MedicaoSalva) => {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('lancamentos')
        .select(`
          *,
          equipes (
            nome,
            empresas (
              nome
            )
          )
        `)
        .order('created_at', { ascending: false })

      // Aplicar filtros salvos
      if (medicao.data_inicio) {
        query = query.gte('data_contrato', medicao.data_inicio)
      }
      if (medicao.data_fim) {
        query = query.lte('data_contrato', medicao.data_fim)
      }
      if (medicao.filtros_aplicados.equipes.length > 0) {
        query = query.in('equipe_id', medicao.filtros_aplicados.equipes.map(id => parseInt(id)))
      }
      if (medicao.filtros_aplicados.cliente) {
        query = query.ilike('nome_cliente', `%${medicao.filtros_aplicados.cliente}%`)
      }

      const { data: lancamentos, error } = await query

      if (error) throw error

      // Exportar CSV
      const headers = [
        'Equipe',
        'Empresa',
        'Cliente',
        'Data do Contrato',
        'Tipo de Serviço',
        'Subitem do Serviço',
        'Valor do Serviço',
        'Descrição'
      ]

      const csvContent = [
        headers.join(','),
        ...(lancamentos || []).map(item => [
          `"${item.equipes?.nome || ''}"`,
          `"${item.equipes?.empresas?.nome || ''}"`,
          `"${item.nome_cliente}"`,
          `"${format(new Date(item.data_contrato), 'dd/MM/yyyy', { locale: ptBR })}"`,
          `"${item.tipo_servico}"`,
          `"${item.tipo_aditivo || item.motivo_desconto || item.tipo_padrao_entrada || item.motivo_visita || item.motivo_obra || ''}"`,
          item.valor_servico.toFixed(2),
          `"${item.motivo_desconto || item.motivo_visita || item.motivo_obra || ''}"`
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `medicao-${medicao.nome}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Medição exportada com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar medição:', error)
      toast.error('Erro ao exportar medição')
    }
  }

  const excluirMedicao = async (medicaoId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta medição?')) return

    try {
      console.log('🗑️ Tentando excluir medição:', medicaoId)
      
      // 1) Tentar via API primeiro
      try {
        console.log('📡 Tentando deletar via API...')
        const response = await fetch(`/api/medicoes?id=${medicaoId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            console.log('✅ Medição excluída via API')
            toast.success('Medição excluída com sucesso!')
            carregarMedicoes()
            return
          } else {
            console.error('❌ API retornou erro:', result.error)
          }
        } else {
          console.error('❌ API retornou status:', response.status)
        }
      } catch (apiError) {
        console.error('❌ Erro na API:', apiError)
      }

      // 2) Fallback: tentar via cliente Supabase diretamente
      console.log('🔄 Tentando via cliente Supabase direto...')
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('medicoes_salvas')
        .delete()
        .eq('id', medicaoId)

      if (error) {
        console.error('❌ Erro ao excluir via Supabase:', error)
        toast.error(`Erro ao excluir medição: ${error.message}`)
        return
      }

      console.log('✅ Medição excluída via Supabase')
      toast.success('Medição excluída com sucesso!')
      carregarMedicoes()
    } catch (error) {
      console.error('❌ Erro geral ao excluir medição:', error)
      toast.error('Erro ao excluir medição')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      <div className="flex-1 lg:ml-0 lg:pl-8">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-8 h-8 mr-3" />
                  Medições Salvas
                </h1>
                <p className="mt-2 text-gray-600">
                  Visualize e gerencie as medições salvas dos relatórios consolidados
                </p>
              </div>
              <Button
                onClick={carregarMedicoes}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Recarregar
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando medições...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Medições ({medicoes.length})
                </h3>
              </div>
              
              {tabelaNaoExiste ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Tabela de Medições não encontrada</p>
                  <p className="text-sm">A tabela de medições ainda não foi criada. Clique em "Criar Tabela" para configurar.</p>
                  <Button
                    onClick={criarTabelaMedicoes}
                    className="mt-4 flex items-center gap-2"
                    disabled={criandoTabela}
                  >
                    {criandoTabela ? (
                      <>
                        <Wrench className="w-4 h-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        Criar Tabela
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                medicoes.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nenhuma medição salva</p>
                    <p className="text-sm">As medições salvas aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {medicoes.map((medicao) => (
                      <div key={medicao.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-medium text-gray-900">
                                {medicao.nome}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {format(new Date(medicao.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                                <span className="text-sm text-gray-600">
                                  {medicao.data_inicio && medicao.data_fim ? 
                                    `${format(new Date(medicao.data_inicio), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(medicao.data_fim), 'dd/MM/yyyy', { locale: ptBR })}` :
                                    'Período não definido'
                                  }
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <Users className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm text-gray-600">
                                  {medicao.total_clientes} clientes
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-yellow-500 mr-2" />
                                <span className="text-sm text-gray-600">
                                  R$ {medicao.total_valor?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </div>

                            {medicao.filtros_aplicados?.cliente && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-gray-500">Cliente filtrado:</span>
                                <span className="text-xs text-gray-700 ml-1">{medicao.filtros_aplicados.cliente}</span>
                              </div>
                            )}

                            {medicao.filtros_aplicados?.equipes?.length > 0 && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-gray-500">Equipes filtradas:</span>
                                <span className="text-xs text-gray-700 ml-1">{medicao.filtros_aplicados.equipes.length} equipe(s)</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => exportarMedicao(medicao)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              Exportar
                            </Button>
                            <Button
                              onClick={() => excluirMedicao(medicao.id)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* Debug Info */}
          {debugInfo.length > 0 && (
            <div className="mt-8 bg-gray-100 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h4>
              <div className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index}>{info}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
