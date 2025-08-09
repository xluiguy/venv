'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/layout/sidebar'
import { getSupabaseClient, type Medicao, type DemonstrativoFinanceiro, type Empresa } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  BarChart3, 
  Plus, 
  Download,
  Calendar,
  Building2,
  Users,
  Zap,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

export default function DemonstrativoPage() {
  const [medicoes, setMedicoes] = useState<Medicao[]>([])
  const [medicaoSelecionada, setMedicaoSelecionada] = useState<string>('')
  const [demonstrativo, setDemonstrativo] = useState<DemonstrativoFinanceiro[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)
  const [showNovaMedicao, setShowNovaMedicao] = useState(false)
  const [novaMedicao, setNovaMedicao] = useState({
    empresa_id: '',
    data_medicao: '',
    total_clientes: 0,
    total_paineis: 0,
    valor_total: 0,
    observacoes: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    if (medicaoSelecionada) {
      carregarDemonstrativo(medicaoSelecionada)
    }
  }, [medicaoSelecionada])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Carregar empresas primeiro
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .order('nome')

      if (empresasError) {
        console.error('Erro ao carregar empresas:', empresasError)
        toast.error('Erro ao carregar empresas')
      } else {
        setEmpresas(empresasData || [])
      }

      // Tentar carregar medições (pode falhar se tabela não existir)
      try {
        const { data: medicoesData, error: medicoesError } = await supabase
          .from('medicoes')
          .select('*')
          .order('created_at', { ascending: false })

        if (medicoesError) {
          console.warn('Tabela medições não existe ainda:', medicoesError.message)
          setMedicoes([])
        } else {
          setMedicoes(medicoesData || [])
          
          if (medicoesData && medicoesData.length > 0 && !medicaoSelecionada) {
            setMedicaoSelecionada(medicoesData[0].id)
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar medições (tabela pode não existir):', error)
        setMedicoes([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const carregarDemonstrativo = async (medicaoId: string) => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Tentar carregar demonstrativo (pode falhar se view não existir)
      try {
        const { data: demonstrativoData, error: demonstrativoError } = await supabase
          .from('demonstrativo_financeiro')
          .select('*')
          .eq('medicao_id', medicaoId)

        if (demonstrativoError) {
          console.warn('View demonstrativo_financeiro não existe ainda:', demonstrativoError.message)
          setDemonstrativo([])
        } else {
          setDemonstrativo(demonstrativoData || [])
        }
      } catch (error) {
        console.warn('Erro ao carregar demonstrativo (view pode não existir):', error)
        setDemonstrativo([])
      }
    } catch (error) {
      console.error('Erro ao carregar demonstrativo:', error)
      toast.error('Erro ao carregar demonstrativo')
    } finally {
      setLoading(false)
    }
  }

  const criarMedicao = async () => {
    if (!novaMedicao.empresa_id || !novaMedicao.data_medicao) {
      toast.error('Preencha empresa e data da medição')
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('medicoes')
        .insert([novaMedicao])
        .select()

      if (error) {
        console.error('Erro ao criar medição:', error)
        toast.error('Erro ao criar medição')
      } else {
        toast.success('Medição criada com sucesso!')
        setShowNovaMedicao(false)
        setNovaMedicao({
          empresa_id: '',
          data_medicao: '',
          total_clientes: 0,
          total_paineis: 0,
          valor_total: 0,
          observacoes: ''
        })
        carregarDados()
      }
    } catch (error) {
      console.error('Erro ao criar medição:', error)
      toast.error('Erro ao criar medição')
    } finally {
      setLoading(false)
    }
  }

  const calcularResumo = () => {
    const resumo = demonstrativo.reduce((acc, item) => {
      acc.totalClientes += item.total_clientes || 0
      acc.totalPaineis += item.total_paineis || 0
      acc.valorTotal += item.valor_total || 0
      return acc
    }, { totalClientes: 0, totalPaineis: 0, valorTotal: 0 })

    return resumo
  }

  const exportarCSV = () => {
    if (demonstrativo.length === 0) {
      toast.error('Não há dados para exportar')
      return
    }

    const headers = ['Empresa', 'Responsável', 'Tipo Remuneração', 'Clientes', 'Painéis', 'Valor Total', 'Data Medição']
    const csvContent = [
      headers.join(','),
      ...demonstrativo.map(item => [
        item.empresa,
        item.responsavel,
        item.tipo_remuneracao,
        item.total_clientes,
        item.total_paineis,
        item.valor_total,
        item.data_medicao
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `demonstrativo_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    toast.success('Relatório exportado com sucesso!')
  }

  const resumo = calcularResumo()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-0 lg:pl-8">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
              <p className="mt-1 text-sm text-gray-500">
                Sistema de gestão financeira para Resolve Energia Solar
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={() => setShowNovaMedicao(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Medição
              </Button>
              <Button
                variant="outline"
                onClick={exportarCSV}
                disabled={demonstrativo.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Empresas</p>
                <p className="text-2xl font-bold text-gray-900">{empresas.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{resumo.totalClientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Painéis</p>
                <p className="text-2xl font-bold text-gray-900">{resumo.totalPaineis}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {resumo.valorTotal.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Medições */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Medições</h3>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : medicoes.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma medição encontrada</p>
                    <p className="text-sm text-gray-400 mt-1">Crie sua primeira medição</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medicoes.map((medicao) => {
                      const empresa = empresas.find(e => e.id === medicao.empresa_id)
                      return (
                        <div
                          key={medicao.id}
                          onClick={() => setMedicaoSelecionada(medicao.id)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            medicaoSelecionada === medicao.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {empresa?.nome || 'Empresa não encontrada'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {format(new Date(medicao.data_medicao), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                R$ {medicao.valor_total.toLocaleString('pt-BR')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {medicao.total_clientes} clientes
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Demonstrativo Financeiro */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Demonstrativo Financeiro</h3>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : demonstrativo.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum demonstrativo disponível</p>
                    <p className="text-sm text-gray-400 mt-1">Selecione uma medição para visualizar</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Empresa
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Responsável
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clientes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Painéis
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {demonstrativo.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.empresa}</div>
                              <div className="text-sm text-gray-500">{item.tipo_remuneracao}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.responsavel}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.total_clientes}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.total_paineis}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              R$ {item.valor_total.toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nova Medição */}
      {showNovaMedicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Nova Medição</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <select
                  value={novaMedicao.empresa_id}
                  onChange={(e) => setNovaMedicao({...novaMedicao, empresa_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Medição
                </label>
                <input
                  type="date"
                  value={novaMedicao.data_medicao}
                  onChange={(e) => setNovaMedicao({...novaMedicao, data_medicao: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total de Clientes
                  </label>
                  <input
                    type="number"
                    value={novaMedicao.total_clientes}
                    onChange={(e) => setNovaMedicao({...novaMedicao, total_clientes: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total de Painéis
                  </label>
                  <input
                    type="number"
                    value={novaMedicao.total_paineis}
                    onChange={(e) => setNovaMedicao({...novaMedicao, total_paineis: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={novaMedicao.valor_total}
                  onChange={(e) => setNovaMedicao({...novaMedicao, valor_total: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={novaMedicao.observacoes}
                  onChange={(e) => setNovaMedicao({...novaMedicao, observacoes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowNovaMedicao(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={criarMedicao}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Criando...' : 'Criar Medição'}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
} 