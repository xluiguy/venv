'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabaseClient, type Equipe, type Lancamento } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  FileText, 
  Download,
  Printer,
  Filter,
  Search,
  Calendar,
  Users,
  DollarSign,
  ChevronDown,
  X,
  Save,
  Edit,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { SalvarMedicaoModal } from '@/components/SalvarMedicaoModal'
import { EditarLancamentoModal } from '@/components/EditarLancamentoModal'

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

interface LancamentoComEquipe extends Lancamento {
  equipe_nome: string
  empresa_nome: string
}

export default function RelatoriosPage() {
  const [equipes, setEquipes] = useState<(Equipe & { empresas: { nome: string } })[]>([])
  const [lancamentos, setLancamentos] = useState<LancamentoComEquipe[]>([])
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    tipo_data: 'data_contrato' as 'data_contrato' | 'data_execucao',
    equipes: [] as string[],
    cliente: ''
  })
  const [equipesDropdownOpen, setEquipesDropdownOpen] = useState(false)
  const [equipesSearch, setEquipesSearch] = useState('')
  const [modalSalvarMedicao, setModalSalvarMedicao] = useState(false)
  const [editandoLancamento, setEditandoLancamento] = useState<LancamentoComEquipe | null>(null)
  const [modalEditarLancamento, setModalEditarLancamento] = useState(false)
  const [deletandoLancamento, setDeletandoLancamento] = useState<string | null>(null)

  useEffect(() => {
    carregarEquipes()
    carregarRelatorio()
  }, [])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.equipes-dropdown')) {
        setEquipesDropdownOpen(false)
      }
    }

    if (equipesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [equipesDropdownOpen])

  const carregarEquipes = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('equipes')
        .select(`
          *,
          empresas (
            nome
          )
        `)
        .order('nome')

      if (error) throw error
      setEquipes(data || [])
    } catch (error) {
      console.error('Erro ao carregar equipes:', error)
      toast.error('Erro ao carregar equipes')
    }
  }

  const carregarRelatorio = async () => {
    setLoading(true)
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

      // Aplicar filtros
      if (filtros.data_inicio) {
        query = query.gte(filtros.tipo_data, filtros.data_inicio)
      }
      if (filtros.data_fim) {
        query = query.lte(filtros.tipo_data, filtros.data_fim)
      }
      if (filtros.equipes.length > 0) {
        query = query.in('equipe_id', filtros.equipes.map(id => parseInt(id)))
      }
      if (filtros.cliente) {
        query = query.ilike('nome_cliente', `%${filtros.cliente}%`)
      }

      const { data, error } = await query

      if (error) throw error

      // Transformar dados para incluir nomes das equipes e empresas
      const lancamentosComEquipe = (data || []).map(lancamento => ({
        ...lancamento,
        equipe_nome: lancamento.equipes?.nome || 'Equipe não encontrada',
        empresa_nome: lancamento.equipes?.empresas?.nome || 'Empresa não encontrada'
      }))

      setLancamentos(lancamentosComEquipe)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      toast.error('Erro ao carregar relatório')
    } finally {
      setLoading(false)
    }
  }

  const limparFiltros = () => {
    setFiltros({
      data_inicio: '',
      data_fim: '',
      tipo_data: 'data_contrato',
      equipes: [],
      cliente: ''
    })
    carregarRelatorio()
  }

  const toggleEquipe = (equipeId: string) => {
    setFiltros(prev => ({
      ...prev,
      equipes: prev.equipes.includes(equipeId)
        ? prev.equipes.filter(id => id !== equipeId)
        : [...prev.equipes, equipeId]
    }))
  }

  const removeEquipe = (equipeId: string) => {
    setFiltros(prev => ({
      ...prev,
      equipes: prev.equipes.filter(id => id !== equipeId)
    }))
  }

  const calcularResumo = () => {
    const totalLancamentos = lancamentos.length
    const totalClientes = new Set(lancamentos.map(l => l.nome_cliente)).size
    const totalValor = lancamentos.reduce((acc, l) => acc + l.valor_servico, 0)

    return {
      total_lancamentos: totalLancamentos,
      total_clientes: totalClientes,
      total_valor: totalValor
    }
  }

  const exportarCSV = () => {
    if (lancamentos.length === 0) {
      toast.error('Não há dados para exportar')
      return
    }

    const headers = [
      'Equipe',
      'Empresa',
      'Cliente',
      'Data do Contrato',
      'Data de Execução',
      'Tipo de Serviço',
      'Subitem do Serviço',
      'Valor do Serviço',
      'Descrição'
    ]

    const csvContent = [
      headers.join(','),
      ...lancamentos.map(item => [
        `"${item.equipe_nome}"`,
        `"${item.empresa_nome}"`,
        `"${item.nome_cliente}"`,
        `"${format(new Date(item.data_contrato), 'dd/MM/yyyy', { locale: ptBR })}"`,
        `"${item.data_execucao ? format(new Date(item.data_execucao), 'dd/MM/yyyy', { locale: ptBR }) : ''}"`,
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
    a.download = `relatorio_lancamentos_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success('Relatório exportado com sucesso!')
  }

  const imprimirRelatorio = () => {
    window.print()
  }

  const salvarMedicao = async (nome: string) => {
    try {
      const resumo = calcularResumo()
      
      // Verificar se há lançamentos para salvar
      if (resumo.total_lancamentos === 0) {
        toast.error('Não é possível salvar uma medição vazia. Adicione lançamentos primeiro.')
        return
      }
      
      console.log('📝 Salvando medição:', {
        nome,
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
        total_lancamentos: resumo.total_lancamentos,
        total_clientes: resumo.total_clientes,
        total_valor: resumo.total_valor,
        filtros_aplicados: {
          equipes: filtros.equipes,
          cliente: filtros.cliente
        }
      })

      // Preparar dados para inserção
      const dadosMedicao = {
        nome,
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
        total_lancamentos: resumo.total_lancamentos,
        total_clientes: resumo.total_clientes,
        total_valor: resumo.total_valor,
        filtros_aplicados: {
          equipes: filtros.equipes,
          cliente: filtros.cliente
        }
      }

      const response = await fetch('/api/medicoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosMedicao),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Falha ao salvar medição via API')
      }

      console.log('✅ Medição salva com sucesso:', result.data)
      toast.success('Medição salva com sucesso!')
      
    } catch (error) {
      console.error('Erro ao salvar medição:', error)
      toast.error('Erro ao salvar medição')
    }
  }

  const editarLancamento = (lancamento: LancamentoComEquipe) => {
    setEditandoLancamento(lancamento)
    setModalEditarLancamento(true)
  }

  const salvarEdicaoLancamento = async (dadosAtualizados: Partial<Lancamento>) => {
    if (!editandoLancamento) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('lancamentos')
        .update(dadosAtualizados)
        .eq('id', editandoLancamento.id)

      if (error) {
        console.error('❌ Erro ao atualizar lançamento:', error)
        toast.error('Erro ao atualizar lançamento')
        return
      }

      toast.success('Lançamento atualizado com sucesso!')
      setModalEditarLancamento(false)
      setEditandoLancamento(null)
      carregarRelatorio() // Recarregar dados
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error)
      toast.error('Erro ao atualizar lançamento')
    }
  }

  const deletarLancamento = async (lancamentoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return

    setDeletandoLancamento(lancamentoId)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('lancamentos')
        .delete()
        .eq('id', lancamentoId)

      if (error) {
        console.error('❌ Erro ao deletar lançamento:', error)
        toast.error('Erro ao deletar lançamento')
        return
      }

      toast.success('Lançamento excluído com sucesso!')
      carregarRelatorio() // Recarregar dados
    } catch (error) {
      console.error('Erro ao deletar lançamento:', error)
      toast.error('Erro ao deletar lançamento')
    } finally {
      setDeletandoLancamento(null)
    }
  }

  const resumo = calcularResumo()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      <div className="flex-1 lg:ml-0 lg:pl-8">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3" />
              Relatório de Todos os Lançamentos
            </h1>
            <p className="mt-2 text-gray-600">
              Visualize e exporte todos os lançamentos com filtros avançados
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={carregarRelatorio}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {loading ? 'Carregando...' : 'Aplicar Filtros'}
                </Button>
                <Button
                  variant="outline"
                  onClick={limparFiltros}
                  className="flex items-center gap-2"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por Data de
                </label>
                <select
                  value={filtros.tipo_data}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipo_data: e.target.value as 'data_contrato' | 'data_execucao' }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="data_contrato">Contrato</option>
                  <option value="data_execucao">Execução</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={filtros.data_inicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fim
                </label>
                <input
                  type="date"
                  value={filtros.data_fim}
                  onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={filtros.cliente}
                  onChange={(e) => setFiltros(prev => ({ ...prev, cliente: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Buscar por cliente"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipes
                </label>
                
                {/* Equipes Selecionadas */}
                {filtros.equipes.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {filtros.equipes.map(equipeId => {
                      const equipe = equipes.find(e => e.id.toString() === equipeId)
                      return equipe ? (
                        <span
                          key={equipeId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {equipe.nome} - {equipe.empresas?.nome}
                          <button
                            onClick={() => removeEquipe(equipeId)}
                            className="ml-1 hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null
                    })}
                  </div>
                )}

                {/* Dropdown de Equipes */}
                <div className="relative equipes-dropdown">
                  <button
                    type="button"
                    onClick={() => setEquipesDropdownOpen(!equipesDropdownOpen)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <span className={filtros.equipes.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                      {filtros.equipes.length > 0 
                        ? `${filtros.equipes.length} equipe(s) selecionada(s)`
                        : 'Selecionar equipes'
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  </button>

                  {equipesDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Buscar equipes..."
                          value={equipesSearch}
                          onChange={(e) => setEquipesSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {equipes
                          .filter(equipe => 
                            equipe.nome.toLowerCase().includes(equipesSearch.toLowerCase()) ||
                            equipe.empresas?.nome.toLowerCase().includes(equipesSearch.toLowerCase())
                          )
                          .map(equipe => (
                            <button
                              key={equipe.id}
                              onClick={() => toggleEquipe(equipe.id.toString())}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                filtros.equipes.includes(equipe.id.toString()) ? 'bg-blue-50 text-blue-900' : ''
                              }`}
                            >
                              {equipe.nome} - {equipe.empresas?.nome}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Lançamentos</p>
                  <p className="text-2xl font-bold text-gray-900">{resumo.total_lancamentos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total de Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{resumo.total_clientes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {resumo.total_valor.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={exportarCSV}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
            <Button
              onClick={imprimirRelatorio}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
            <Button
              onClick={() => setModalSalvarMedicao(true)}
              disabled={resumo.total_lancamentos === 0}
              className="flex items-center gap-2"
              title={resumo.total_lancamentos === 0 ? 'Adicione lançamentos para salvar uma medição' : ''}
            >
              <Save className="w-4 h-4" />
              Salvar Medição
            </Button>
          </div>

          {/* Tabela de Lançamentos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Lançamentos</h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando relatório...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Equipe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data do Contrato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Execução
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo de Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subitem do Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor do Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lancamentos.map((lancamento) => (
                      <tr key={lancamento.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lancamento.equipe_nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lancamento.empresa_nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lancamento.nome_cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(lancamento.data_contrato), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lancamento.data_execucao ? format(new Date(lancamento.data_execucao), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lancamento.tipo_servico === 'instalacao' ? 'bg-blue-100 text-blue-800' :
                            lancamento.tipo_servico === 'aditivo' ? 'bg-green-100 text-green-800' :
                            lancamento.tipo_servico === 'desconto' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lancamento.tipo_servico.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lancamento.tipo_aditivo || lancamento.motivo_desconto || lancamento.tipo_padrao_entrada || lancamento.motivo_visita || lancamento.motivo_obra || '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          lancamento.valor_servico < 0 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          R$ {lancamento.valor_servico.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {lancamento.motivo_desconto || lancamento.motivo_visita || lancamento.motivo_obra || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => editarLancamento(lancamento)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Editar lançamento"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletarLancamento(lancamento.id)}
                              disabled={deletandoLancamento === lancamento.id}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                              title="Excluir lançamento"
                            >
                              {deletandoLancamento === lancamento.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && lancamentos.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Nenhum lançamento encontrado com os filtros aplicados
              </div>
            )}
          </div>

          {/* Modal Salvar Medição */}
          <SalvarMedicaoModal
            isOpen={modalSalvarMedicao}
            onClose={() => setModalSalvarMedicao(false)}
            onSave={salvarMedicao}
            filtros={filtros}
            resumo={resumo}
          />

          {/* Modal Editar Lançamento */}
          <EditarLancamentoModal
            isOpen={modalEditarLancamento}
            onClose={() => {
              setModalEditarLancamento(false)
              setEditandoLancamento(null)
            }}
            onSave={salvarEdicaoLancamento}
            lancamento={editandoLancamento}
          />
        </div>
      </div>
    </div>
  )
} 