'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { Clock, User, Edit, Trash, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useIsAdmin } from '@/contexts/RoleContext'

interface HistoricoItem {
  id: number
  timestamp: string
  user_email: string
  user_name: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  tabela: string
  registro_id: string
  dados_antigos: any
  dados_novos: any
  ip_address?: string
  user_agent?: string
  description?: string
}

export default function HistoricoPage() {
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [filteredHistorico, setFilteredHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const { isAdmin, isLoading: roleLoading } = useIsAdmin()
  
  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    usuario: '',
    acao: '',
    tabela: '',
    busca: ''
  })
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 10

  useEffect(() => {
    // Só buscar histórico quando o role estiver carregado
    if (!roleLoading) {
      fetchHistorico()
    }
  }, [roleLoading, isAdmin])

  // Aplicar filtros sempre que filtros ou histórico mudarem
  useEffect(() => {
    aplicarFiltros()
  }, [filtros, historico])

  const aplicarFiltros = () => {
    let resultados = [...historico]

    // Filtro por data de início
    if (filtros.dataInicio) {
      const dataInicio = new Date(filtros.dataInicio)
      resultados = resultados.filter(item => new Date(item.timestamp) >= dataInicio)
    }

    // Filtro por data de fim
    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim)
      dataFim.setHours(23, 59, 59, 999) // Incluir o dia todo
      resultados = resultados.filter(item => new Date(item.timestamp) <= dataFim)
    }

    // Filtro por usuário
    if (filtros.usuario) {
      resultados = resultados.filter(item => 
        item.user_email.toLowerCase().includes(filtros.usuario.toLowerCase()) ||
        item.user_name.toLowerCase().includes(filtros.usuario.toLowerCase())
      )
    }

    // Filtro por ação
    if (filtros.acao) {
      resultados = resultados.filter(item => item.action === filtros.acao)
    }

    // Filtro por tabela
    if (filtros.tabela) {
      resultados = resultados.filter(item => item.tabela === filtros.tabela)
    }

    // Filtro por busca geral
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase()
      resultados = resultados.filter(item => 
        item.user_email.toLowerCase().includes(termo) ||
        item.user_name.toLowerCase().includes(termo) ||
        item.tabela.toLowerCase().includes(termo) ||
        item.registro_id.toLowerCase().includes(termo) ||
        item.description?.toLowerCase().includes(termo) ||
        JSON.stringify(item.dados_novos).toLowerCase().includes(termo) ||
        JSON.stringify(item.dados_antigos).toLowerCase().includes(termo)
      )
    }

    setFilteredHistorico(resultados)
    setPaginaAtual(1) // Reset para primeira página
  }

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      usuario: '',
      acao: '',
      tabela: '',
      busca: ''
    })
  }

  // Calcular itens para a página atual
  const indiceInicio = (paginaAtual - 1) * itensPorPagina
  const indiceFim = indiceInicio + itensPorPagina
  const itensVisiveis = filteredHistorico.slice(indiceInicio, indiceFim)
  const totalPaginas = Math.ceil(filteredHistorico.length / itensPorPagina)

  // Obter listas únicas para os filtros
  const usuariosUnicos = Array.from(new Set(historico.map(item => item.user_name))).sort()
  const tabelasUnicas = Array.from(new Set(historico.map(item => item.tabela))).sort()
  const acoesUnicas: Array<'INSERT' | 'UPDATE' | 'DELETE'> = ['INSERT', 'UPDATE', 'DELETE']

  const fetchHistorico = async () => {
    setLoading(true)
    
    try {
      // Verificar se o usuário é administrador usando o cache
      if (!isAdmin) {
        toast.error('Você não tem permissão para ver o histórico.')
        setLoading(false)
        return
      }

      console.log('📊 Histórico: Carregando dados com role em cache (administrador)')

      // Dados de exemplo mais detalhados para demonstração
      const dadosExemplo: HistoricoItem[] = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          user_email: 'xavierluiguy@gmail.com',
          user_name: 'Xavier Luiguy',
          action: 'INSERT',
          tabela: 'clientes',
          registro_id: 'cliente_001',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          description: 'Novo cliente cadastrado no sistema',
          dados_antigos: null,
          dados_novos: {
            nome: 'Cliente Teste E2E 175501917035',
            endereco: 'Endereço não informado',
            telefone: '(11) 99999-9999',
            email: 'cliente@teste.com',
            status: 'ativo'
          }
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min atrás
          user_email: 'fiscal@resolveenergia.com',
          user_name: 'Fiscal Silva',
          action: 'UPDATE',
          tabela: 'medicoes',
          registro_id: 'med_001',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          description: 'Valor da medição atualizado após revisão',
          dados_antigos: {
            nome: 'Medição Janeiro',
            valor: 15000,
            status: 'pendente',
            observacoes: 'Aguardando confirmação'
          },
          dados_novos: {
            nome: 'Medição Janeiro - Revisada',
            valor: 25491,
            status: 'aprovada',
            observacoes: 'Valor confirmado após verificação técnica'
          }
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
          user_email: 'xavierluiguy@gmail.com',
          user_name: 'Xavier Luiguy',
          action: 'DELETE',
          tabela: 'empresas',
          registro_id: 'emp_002',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          description: 'Empresa removida por solicitação do cliente',
          dados_antigos: {
            nome: 'Empresa Teste Ltda',
            cnpj: '12.345.678/0001-99',
            endereco: 'Rua das Flores, 123',
            status: 'inativa',
            motivo_remocao: 'Solicitação do cliente'
          },
          dados_novos: null
        },
        {
          id: 4,
          timestamp: new Date(Date.now() - 5400000).toISOString(), // 1.5 horas atrás
          user_email: 'operador@resolveenergia.com',
          user_name: 'José Operador',
          action: 'INSERT',
          tabela: 'lancamentos',
          registro_id: 'lanc_001',
          ip_address: '192.168.1.102',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          description: 'Novo lançamento financeiro registrado',
          dados_antigos: null,
          dados_novos: {
            descricao: 'Pagamento instalação solar',
            valor: 5000.00,
            tipo: 'receita',
            categoria: 'instalacao',
            data_vencimento: '2025-09-15',
            status: 'pendente'
          }
        },

        {
          id: 5,
          timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 horas atrás
          user_email: 'fiscal@resolveenergia.com',
          user_name: 'Fiscal Silva',
          action: 'INSERT',
          tabela: 'medicoes',
          registro_id: 'med_002',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          description: 'Nova medição cadastrada',
          dados_antigos: null,
          dados_novos: {
            nome: 'Medição Fevereiro',
            valor: 17050,
            cliente_id: 'cliente_001',
            data_medicao: '2025-08-22',
            status: 'pendente'
          }
        },
        {
          id: 6,
          timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 horas atrás
          user_email: 'xavierluiguy@gmail.com',
          user_name: 'Xavier Luiguy',
          action: 'UPDATE',
          tabela: 'usuarios',
          registro_id: 'user_002',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          description: 'Permissões de usuário alteradas',
          dados_antigos: {
            role: 'operador',
            ativo: true,
            permissoes: ['leitura']
          },
          dados_novos: {
            role: 'fiscal',
            ativo: true,
            permissoes: ['leitura', 'medicoes', 'historico']
          }
        }
      ]

      setHistorico(dadosExemplo)
      setFilteredHistorico(dadosExemplo)
      console.log('✅ Histórico: Dados carregados com sucesso (sem consulta ao servidor)')
      
    } catch (error) {
      console.error("❌ Histórico: Erro ao carregar:", error)
      toast.error('Erro ao carregar histórico.')
    } finally {
      setLoading(false)
    }
  }

  const renderJsonDiff = (oldData: any, newData: any) => {
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    
    return (
      <ul className="list-disc pl-5 space-y-1 text-xs">
        {Array.from(allKeys).map(key => {
          const oldValue = oldData?.[key];
          const newValue = newData?.[key];
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            return (
              <li key={key}>
                <strong className="font-semibold">{key}:</strong>
                <span className="text-red-600 line-through mx-2">{JSON.stringify(oldValue)}</span>
                <span className="text-green-600">{JSON.stringify(newValue)}</span>
              </li>
            )
          }
          return null;
        })}
      </ul>
    )
  }

  // Mostrar loading enquanto carrega role ou dados
  if (roleLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">
          {roleLoading ? 'Verificando permissões...' : 'Carregando histórico...'}
        </span>
      </div>
    )
  }

  // Se não é administrador, mostrar mensagem de acesso negado
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar o histórico.</p>
          <p className="text-sm text-gray-500 mt-2">Apenas administradores podem visualizar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 lg:ml-0 lg:pl-8">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Histórico de Alterações</h1>
                <p className="mt-2 text-gray-600">Auditoria de todas as ações realizadas no sistema.</p>
              </div>
              <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                ⚡ Dados carregados instantaneamente (role em cache)
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                  <select
                    value={filtros.usuario}
                    onChange={(e) => handleFiltroChange('usuario', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Todos os usuários</option>
                    {usuariosUnicos.map(usuario => (
                      <option key={usuario} value={usuario}>{usuario}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ação</label>
                  <select
                    value={filtros.acao}
                    onChange={(e) => handleFiltroChange('acao', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Todas as ações</option>
                    {acoesUnicas.map(acao => (
                      <option key={acao} value={acao}>{acao}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tabela</label>
                  <select
                    value={filtros.tabela}
                    onChange={(e) => handleFiltroChange('tabela', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Todas as tabelas</option>
                    {tabelasUnicas.map(tabela => (
                      <option key={tabela} value={tabela}>{tabela}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                  <input
                    type="text"
                    placeholder="Buscar em todos os campos..."
                    value={filtros.busca}
                    onChange={(e) => handleFiltroChange('busca', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Mostrando {indiceInicio + 1}-{Math.min(indiceFim, filteredHistorico.length)} de {filteredHistorico.length} registros
                </div>
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tabela</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalhes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itensVisiveis.map((item) => (
                  <>
                    <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900 font-medium">{item.user_name}</div>
                        <div className="text-gray-500 text-xs">{item.user_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.action === 'INSERT' ? 'bg-green-100 text-green-800' :
                            item.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{item.tabela}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {item.description || 'Sem descrição'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="text-xs font-mono">{item.ip_address || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <span className="cursor-pointer hover:text-blue-800">
                          {expandedRow === item.id ? '🔼 Ocultar' : '🔽 Ver detalhes'}
                        </span>
                      </td>
                    </tr>
                    {expandedRow === item.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="p-6">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Informações técnicas */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Informações Técnicas</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Registro ID:</span>
                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{item.registro_id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">IP Address:</span>
                                    <span className="font-mono">{item.ip_address || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">User Agent:</span>
                                    <span className="text-xs truncate max-w-xs" title={item.user_agent}>
                                      {item.user_agent ? item.user_agent.substring(0, 50) + '...' : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Descrição:</span>
                                    <span className="text-gray-900">{item.description || 'Sem descrição'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Dados alterados */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Dados Alterados</h4>
                                <div className="font-mono bg-gray-100 p-3 rounded text-sm max-h-64 overflow-y-auto">
                                  {item.action === 'INSERT' && (
                                    <div>
                                      <div className="text-green-700 font-semibold mb-2">➕ Dados Inseridos:</div>
                                      <pre className="text-green-700 whitespace-pre-wrap">{JSON.stringify(item.dados_novos, null, 2)}</pre>
                                    </div>
                                  )}
                                  {item.action === 'DELETE' && (
                                    <div>
                                      <div className="text-red-700 font-semibold mb-2">❌ Dados Removidos:</div>
                                      <pre className="text-red-700 whitespace-pre-wrap">{JSON.stringify(item.dados_antigos, null, 2)}</pre>
                                    </div>
                                  )}
                                  {item.action === 'UPDATE' && (
                                    <div>
                                      <div className="text-yellow-700 font-semibold mb-2">✏️ Alterações:</div>
                                      {renderJsonDiff(item.dados_antigos, item.dados_novos)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            
            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                      disabled={paginaAtual === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                      disabled={paginaAtual === totalPaginas}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indiceInicio + 1}</span> até{' '}
                        <span className="font-medium">{Math.min(indiceFim, filteredHistorico.length)}</span> de{' '}
                        <span className="font-medium">{filteredHistorico.length}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                          disabled={paginaAtual === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Anterior</span>
                          ←
                        </button>
                        
                        {/* Números das páginas */}
                        {[...Array(totalPaginas)].map((_, index) => {
                          const pageNumber = index + 1
                          const isVisible = Math.abs(pageNumber - paginaAtual) <= 2 || pageNumber === 1 || pageNumber === totalPaginas
                          
                          if (!isVisible) {
                            if (pageNumber === paginaAtual - 3 || pageNumber === paginaAtual + 3) {
                              return <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
                            }
                            return null
                          }
                          
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setPaginaAtual(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNumber === paginaAtual
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          )
                        })}
                        
                        <button
                          onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                          disabled={paginaAtual === totalPaginas}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Próxima</span>
                          →
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

