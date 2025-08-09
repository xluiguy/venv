'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabaseClient, type Equipe, type Medicao, type Empresa } from '@/lib/supabase'
import { 
  Plus, 
  Calculator,
  Users,
  Calendar,
  DollarSign,
  Package,
  Wrench,
  Building2,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

type TipoServico = 'instalacao' | 'aditivo' | 'desconto' | 'padrao_entrada' | 'visita_tecnica' | 'obra_civil'

interface FormData {
  equipe_id: string
  cliente: string
  data_contrato: string
  data_execucao: string
  tipo_servico: TipoServico
  // Campos específicos por tipo de serviço
  numero_paineis?: string
  potencia_painel?: string
  valor_aditivo?: string
  tipo_aditivo?: string
  valor_desconto?: string
  motivo_desconto?: string
  valor_padrao?: string
  tipo_padrao?: string
  valor_visita?: string
  motivo_visita?: string
  valor_obra?: string
  descricao_material?: string
  motivo_obra?: string
  // Campo para armazenar o valor calculado
  valor_calculado?: number
}

export default function LancamentosPage() {
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)
  const [calculando, setCalculando] = useState(false)
  const [valorCalculado, setValorCalculado] = useState<number | null>(null)
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    equipe_id: '',
    cliente: '',
    data_contrato: '',
    data_execucao: '',
    tipo_servico: 'instalacao'
  })

  useEffect(() => {
    carregarDados()
  }, [])

  // Atualizar empresa selecionada quando equipe mudar
  useEffect(() => {
    if (formData.equipe_id) {
      console.log('Equipe selecionada:', formData.equipe_id)
      const equipe = equipes.find(e => e.id === formData.equipe_id)
      console.log('Equipe encontrada:', equipe)
      if (equipe) {
        const empresa = empresas.find(e => e.id === equipe.empresa_id)
        console.log('Empresa encontrada:', empresa)
        setEmpresaSelecionada(empresa || null)
      }
    } else {
      setEmpresaSelecionada(null)
    }
  }, [formData.equipe_id, equipes, empresas])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const [equipesRes, empresasRes] = await Promise.all([
        supabase.from('equipes').select('*').order('nome'),
        supabase.from('empresas').select('*').order('nome')
      ])

      if (equipesRes.error) throw equipesRes.error
      if (empresasRes.error) throw empresasRes.error

      setEquipes(equipesRes.data || [])
      setEmpresas(empresasRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const calcularValorInstalacao = async () => {
    if (!formData.equipe_id || !formData.numero_paineis) {
      toast.error('Selecione uma equipe e informe o número de painéis')
      return
    }

    if (!empresaSelecionada) {
      toast.error('Empresa não encontrada para a equipe selecionada')
      return
    }

    setCalculando(true)
    try {
      let valor = 0
      let descricaoCalculo = ''


      if (empresaSelecionada.tipo_remuneracao === 'painel' || empresaSelecionada.tipo_remuneracao === 'por_painel') {
        // Por painel: R$ 90,00 por painel
        valor = parseInt(formData.numero_paineis!) * 90
        descricaoCalculo = `${formData.numero_paineis} painéis × R$ 90,00 = R$ ${valor.toFixed(2)}`
      } else if ((empresaSelecionada.tipo_remuneracao === 'kwp' || empresaSelecionada.tipo_remuneracao === 'por_kwp') && formData.potencia_painel) {
        // Por kWp: valor por kWp × potência total
        const potenciaTotal = (parseInt(formData.numero_paineis!) * parseInt(formData.potencia_painel)) / 1000
        valor = potenciaTotal * (empresaSelecionada.valor_kwp || 0)
        descricaoCalculo = `${formData.numero_paineis} painéis × ${formData.potencia_painel}W = ${potenciaTotal.toFixed(2)} kWp × R$ ${empresaSelecionada.valor_kwp}/kWp = R$ ${valor.toFixed(2)}`
      } else if ((empresaSelecionada.tipo_remuneracao === 'kwp' || empresaSelecionada.tipo_remuneracao === 'por_kwp') && !formData.potencia_painel) {
        toast.error('Para remuneração por kWp, informe a potência do painel')
        return
      }

      setValorCalculado(valor)
      setFormData(prev => ({ ...prev, valor_calculado: valor }))
      toast.success(`Valor calculado: R$ ${valor.toFixed(2)}`)
    } catch (error) {
      console.error('Erro ao calcular valor:', error)
      toast.error('Erro ao calcular valor')
    } finally {
      setCalculando(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.equipe_id || !formData.cliente || !formData.data_contrato || !formData.data_execucao) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Validações específicas por tipo de serviço
    const validacoes = {
      instalacao: () => {
        console.log('Validando instalação...')
        console.log('Número de painéis:', formData.numero_paineis)
        console.log('Potência do painel:', formData.potencia_painel)
        console.log('Valor calculado:', formData.valor_calculado)
        console.log('Tipo remuneração:', empresaSelecionada?.tipo_remuneracao)
        
        if (!formData.numero_paineis) {
          toast.error('Informe o número de painéis')
          return false
        }
        if ((empresaSelecionada?.tipo_remuneracao === 'kwp' || empresaSelecionada?.tipo_remuneracao === 'por_kwp') && !formData.potencia_painel) {
          toast.error('Para remuneração por kWp, informe a potência do painel')
          return false
        }
        if (formData.valor_calculado === null || formData.valor_calculado === undefined) {
          toast.error('Calcule o valor antes de cadastrar')
          return false
        }
        console.log('Validação de instalação passou')
        return true
      },
      aditivo: () => {
        if (!formData.valor_aditivo || !formData.tipo_aditivo) {
          toast.error('Informe o valor e tipo do aditivo')
          return false
        }
        return true
      },
      desconto: () => {
        if (!formData.valor_desconto || !formData.motivo_desconto) {
          toast.error('Informe o valor e motivo do desconto')
          return false
        }
        return true
      },
      padrao_entrada: () => {
        if (!formData.valor_padrao || !formData.tipo_padrao) {
          toast.error('Informe o valor e tipo do padrão de entrada')
          return false
        }
        return true
      },
      visita_tecnica: () => {
        if (!formData.valor_visita || !formData.motivo_visita) {
          toast.error('Informe o valor e motivo da visita técnica')
          return false
        }
        return true
      },
      obra_civil: () => {
        if (!formData.valor_obra || !formData.descricao_material || !formData.motivo_obra) {
          toast.error('Informe o valor, descrição do material e motivo da obra')
          return false
        }
        return true
      }
    }

    if (!validacoes[formData.tipo_servico]()) {
      return
    }

    try {
      let valor = 0
      let descricao = ''

      switch (formData.tipo_servico) {
        case 'instalacao':
          valor = formData.valor_calculado || 0
          break
        case 'aditivo':
          valor = parseFloat(formData.valor_aditivo!)
          break
        case 'desconto':
          valor = -parseFloat(formData.valor_desconto!)
          descricao = formData.motivo_desconto!
          break
        case 'padrao_entrada':
          valor = parseFloat(formData.valor_padrao!)
          break
        case 'visita_tecnica':
          valor = parseFloat(formData.valor_visita!)
          descricao = formData.motivo_visita!
          break
        case 'obra_civil':
          valor = parseFloat(formData.valor_obra!)
          descricao = `${formData.descricao_material} - ${formData.motivo_obra}`
          break
      }

      // Preparar dados do lançamento
      const lancamentoData: any = {
        equipe_id: formData.equipe_id,
        cliente: formData.cliente,
        tipo_servico: formData.tipo_servico,
        data_contrato: formData.data_contrato,
        data_execucao: formData.data_execucao,
        valor_servico: valor
      }

      // Log para debug
      console.log('Dados do lançamento:', lancamentoData)
      console.log('Campos do lancamentoData:', Object.keys(lancamentoData))
      console.log('Verificando se há campo cliente:', 'cliente' in lancamentoData)

      // Adicionar campos específicos baseados no tipo de serviço
      if (formData.tipo_servico === 'instalacao' && empresaSelecionada) {
        if (empresaSelecionada.tipo_remuneracao === 'kwp') {
          // Para remuneração por kWp: armazenar número de painéis e potência
          lancamentoData.numero_paineis = parseInt(formData.numero_paineis!)
          lancamentoData.potencia_painel = parseInt(formData.potencia_painel!)
        } else if (empresaSelecionada.tipo_remuneracao === 'painel') {
          // Para remuneração por painel: armazenar apenas número de painéis
          lancamentoData.numero_paineis = parseInt(formData.numero_paineis!)
        }
      }

      // Adicionar campos específicos para outros tipos de serviço
      if (formData.tipo_servico === 'aditivo') {
        lancamentoData.tipo_aditivo = formData.tipo_aditivo
      } else if (formData.tipo_servico === 'desconto') {
        lancamentoData.motivo_desconto = formData.motivo_desconto
      } else if (formData.tipo_servico === 'padrao_entrada') {
        lancamentoData.tipo_padrao = formData.tipo_padrao
      } else if (formData.tipo_servico === 'visita_tecnica') {
        lancamentoData.motivo_visita = formData.motivo_visita
      } else if (formData.tipo_servico === 'obra_civil') {
        lancamentoData.descricao_material = formData.descricao_material
        lancamentoData.motivo_obra = formData.motivo_obra
      }

      const supabase = getSupabaseClient()
      console.log('Tentando inserir lançamento...')
      console.log('Dados completos a serem inseridos:', JSON.stringify(lancamentoData, null, 2))
      
      let data: any = null
      try {
        const result = await supabase
          .from('lancamentos')
          .insert([lancamentoData])
          .select()

        if (result.error) {
          console.error('Erro detalhado:', result.error)
          console.error('Código:', result.error.code)
          console.error('Detalhes:', result.error.details)
          console.error('Hint:', result.error.hint)
          console.error('Mensagem completa:', result.error.message)
          throw result.error
        }

        data = result.data
        console.log('Resposta do Supabase:', data)
      } catch (insertError) {
        console.error('Erro durante inserção:', insertError)
        throw insertError
      }

      console.log('Lançamento inserido com sucesso:', data)

      toast.success('Lançamento cadastrado com sucesso!')
      
      // Limpar formulário
      setFormData({
        equipe_id: '',
        cliente: '',
        data_contrato: '',
        data_execucao: '',
        tipo_servico: 'instalacao',
        valor_calculado: undefined
      })
      setValorCalculado(null)
    } catch (error) {
      console.error('Erro ao cadastrar lançamento:', error)
      toast.error('Erro ao cadastrar lançamento')
    }
  }

  const getEmpresaPorEquipe = (equipeId: string) => {
    const equipe = equipes.find(e => e.id.toString() === equipeId)
    return empresas.find(e => e.id === equipe?.empresa_id)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      <div className="flex-1 lg:ml-0 lg:pl-8">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cadastro de Lançamentos</h1>
              <p className="mt-1 text-sm text-gray-500">
                Cadastre novos lançamentos financeiros
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Novo Lançamento</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informações da Empresa */}
            {empresaSelecionada && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-900">Empresa Selecionada</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Empresa:</span>
                    <span className="ml-2 text-gray-900">{empresaSelecionada.nome}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Responsável:</span>
                    <span className="ml-2 text-gray-900">{empresaSelecionada.responsavel}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tipo de Remuneração:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      (empresaSelecionada.tipo_remuneracao === 'painel' || empresaSelecionada.tipo_remuneracao === 'por_painel')
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {(empresaSelecionada.tipo_remuneracao === 'painel' || empresaSelecionada.tipo_remuneracao === 'por_painel') ? 'Por Painel (R$ 90,00)' : `Por kWp (R$ ${empresaSelecionada.valor_kwp}/kWp)`}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Beneficiário:</span>
                    <span className="ml-2 text-gray-900">{empresaSelecionada.beneficiario}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipe de Execução *
                </label>
                <select
                  value={formData.equipe_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipe_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione uma equipe</option>
                  {equipes.map((equipe) => {
                    const empresa = getEmpresaPorEquipe(equipe.id.toString())
                    return (
                      <option key={equipe.id} value={equipe.id}>
                        {equipe.nome} - {empresa?.nome}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={formData.cliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Contrato *
                </label>
                <input
                  type="date"
                  value={formData.data_contrato}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_contrato: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Execução *
                </label>
                <input
                  type="date"
                  value={formData.data_execucao}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_execucao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Serviço *
                </label>
                <select
                  value={formData.tipo_servico}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo_servico: e.target.value as TipoServico }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="instalacao">Instalação</option>
                  <option value="aditivo">Aditivo</option>
                  <option value="desconto">Desconto</option>
                  <option value="padrao_entrada">Padrão de Entrada</option>
                  <option value="visita_tecnica">Visita Técnica</option>
                  <option value="obra_civil">Obra Civil</option>
                </select>
              </div>
            </div>

            {/* Campos específicos por tipo de serviço */}
            {formData.tipo_servico === 'instalacao' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-800">Regra de Negócio</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {(empresaSelecionada?.tipo_remuneracao === 'painel' || empresaSelecionada?.tipo_remuneracao === 'por_painel')
                      ? 'Remuneração por painel: R$ 90,00 por painel instalado'
                      : `Remuneração por kWp: R$ ${empresaSelecionada?.valor_kwp}/kWp × potência total (número de painéis × potência do painel ÷ 1000)`
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Painéis *
                    </label>
                    <input
                      type="number"
                      value={formData.numero_paineis || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, numero_paineis: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>
                  
                  {(empresaSelecionada?.tipo_remuneracao === 'kwp' || empresaSelecionada?.tipo_remuneracao === 'por_kwp') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Potência do Painel (Watts) *
                      </label>
                      <input
                        type="number"
                        value={formData.potencia_painel || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, potencia_painel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="1"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={calcularValorInstalacao}
                      disabled={calculando || !formData.equipe_id || !formData.numero_paineis || ((empresaSelecionada?.tipo_remuneracao === 'kwp' || empresaSelecionada?.tipo_remuneracao === 'por_kwp') && !formData.potencia_painel)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      {calculando ? 'Calculando...' : 'Calcular Valor'}
                    </Button>
                  </div>
                </div>

                {/* Valor calculado */}
                {valorCalculado !== null && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-900 font-medium">
                        Valor calculado: R$ {valorCalculado.toFixed(2)}
                      </span>
                    </div>
                    {(empresaSelecionada?.tipo_remuneracao === 'painel' || empresaSelecionada?.tipo_remuneracao === 'por_painel') && (
                      <p className="text-sm text-green-700 mt-1">
                        {formData.numero_paineis} painéis × R$ 90,00 = R$ {valorCalculado.toFixed(2)}
                      </p>
                    )}
                    {(empresaSelecionada?.tipo_remuneracao === 'kwp' || empresaSelecionada?.tipo_remuneracao === 'por_kwp') && formData.potencia_painel && (
                      <p className="text-sm text-green-700 mt-1">
                        {formData.numero_paineis} painéis × {formData.potencia_painel}W = {((parseInt(formData.numero_paineis!) * parseInt(formData.potencia_painel)) / 1000).toFixed(2)} kWp × R$ {empresaSelecionada.valor_kwp}/kWp = R$ {valorCalculado.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {formData.tipo_servico === 'aditivo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor do Aditivo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_aditivo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_aditivo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Aditivo *
                  </label>
                  <select
                    value={formData.tipo_aditivo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_aditivo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Logístico">Logístico</option>
                    <option value="Instalação">Instalação</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
            )}

            {formData.tipo_servico === 'desconto' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor do Desconto *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_desconto || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_desconto: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo *
                  </label>
                  <textarea
                    value={formData.motivo_desconto || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivo_desconto: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Motivo do desconto"
                    required
                  />
                </div>
              </div>
            )}

            {formData.tipo_servico === 'padrao_entrada' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_padrao || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_padrao: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo_padrao || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_padrao: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Fachada">Fachada</option>
                    <option value="Poste Auxiliar">Poste Auxiliar</option>
                    <option value="Padrão 3 Compartimentos">Padrão 3 Compartimentos</option>
                  </select>
                </div>
              </div>
            )}

            {formData.tipo_servico === 'visita_tecnica' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor da Visita *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_visita || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_visita: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo da Visita *
                  </label>
                  <textarea
                    value={formData.motivo_visita || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivo_visita: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Motivo da visita técnica"
                    required
                  />
                </div>
              </div>
            )}

            {formData.tipo_servico === 'obra_civil' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor da Obra *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_obra || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_obra: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Material *
                  </label>
                  <textarea
                    value={formData.descricao_material || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao_material: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descrição do material utilizado"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo da Obra *
                  </label>
                  <textarea
                    value={formData.motivo_obra || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivo_obra: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Motivo da obra civil"
                    required
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Lançamento'}
            </Button>
          </form>
        </div>
      </div>
      </div>
    </div>
  )
} 