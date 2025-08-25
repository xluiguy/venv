'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import AutoCliente from '@/components/AutoCliente'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { resolverPrecoPainel, resolverPrecoKwp, type FontePreco } from '@/lib/preco'
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

interface Empresa {
  id: string
  nome: string
  responsavel: string
  cnpj?: string | null
  telefone?: string | null
  email?: string | null
  endereco?: string | null
  chave_pix?: string | null
  beneficiario_conta?: string | null
  tipo_remuneracao: string
  valor_kwp?: number | null
  valor_painel?: number | null
  created_at: string | null
  updated_at: string | null
}

interface Equipe {
  id: string
  empresa_id: string | null
  nome: string
  valor_por_kwp_decimal?: number | null
  valor_por_painel_decimal?: number | null
  created_at: string | null
  updated_at: string | null
}

interface Cliente {
  id: string
  nome: string
  documento?: string | null
  email?: string | null
  telefone?: string | null
  empresa_id?: string | null
  ativo: boolean
  created_at: string
  updated_at: string
  endereco?: string | null
  data_contrato?: string | null
}

interface FormData {
  equipe_id: string
  cliente_id: string | null
  cliente_nome: string
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
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [fontePreco, setFontePreco] = useState<FontePreco>('global')
  const [overrideValorPainel, setOverrideValorPainel] = useState<string>('')
  const [usarValorOverride, setUsarValorOverride] = useState(false)
  const [tiposServico, setTiposServico] = useState<Array<{ id: string; nome: string; codigo: string; modelo_cobranca: string; exige_quantidade_paineis: boolean; exige_kwp: boolean; exige_horas: boolean; valor_unitario_decimal?: number }>>([])
  const [tipoServicoId, setTipoServicoId] = useState<string>('')
  const prefixByTipo: Record<TipoServico, string> = {
    instalacao: 'instalacao',
    aditivo: 'aditivo',
    desconto: 'desconto',
    padrao_entrada: 'padrao_entrada',
    visita_tecnica: 'visita_tecnica',
    obra_civil: 'obra_civil'
  }
  
  const [formData, setFormData] = useState<FormData>({
    equipe_id: '',
    cliente_id: null,
    cliente_nome: '',
    data_execucao: '', // Começa vazio
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
      
      // Carregar tipos de serviço fixos baseados na nossa nova estrutura
      const tiposFixos = [
        // Serviços de Instalação
        {
          id: 'instalacao_painel',
          nome: 'Instalação (por painel)',
          codigo: 'instalacao_painel',
          modelo_cobranca: 'painel',
          exige_quantidade_paineis: true,
          exige_kwp: false,
          exige_horas: false
        },
        {
          id: 'instalacao_kwp',
          nome: 'Instalação (por kWp)',
          codigo: 'instalacao_kwp',
          modelo_cobranca: 'kwp',
          exige_quantidade_paineis: true,
          exige_kwp: true,
          exige_horas: false,
          valor_unitario_decimal: 320.00  // Valor padrão por kWp
        },
        
        // Tipos de Serviço Auxiliares
        {
          id: 'aditivo',
          nome: 'Aditivo',
          codigo: 'aditivo',
          modelo_cobranca: 'painel',
          exige_quantidade_paineis: false,
          exige_kwp: false,
          exige_horas: false
        },
        {
          id: 'desconto',
          nome: 'Desconto',
          codigo: 'desconto',
          modelo_cobranca: 'painel',
          exige_quantidade_paineis: false,
          exige_kwp: false,
          exige_horas: false
        },
        {
          id: 'obra_civil',
          nome: 'Obra Civil',
          codigo: 'obra_civil',
          modelo_cobranca: 'painel',
          exige_quantidade_paineis: false,
          exige_kwp: false,
          exige_horas: false
        },
        {
          id: 'padrao_entrada',
          nome: 'Padrão de Entrada',
          codigo: 'padrao_entrada',
          modelo_cobranca: 'painel',
          exige_quantidade_paineis: false,
          exige_kwp: false,
          exige_horas: false
        },
        {
          id: 'visita_tecnica',
          nome: 'Visita Técnica',
          codigo: 'visita_tecnica',
          modelo_cobranca: 'painel',
          exige_quantidade_paineis: false,
          exige_kwp: false,
          exige_horas: false
        }
      ]
      
      setTiposServico(tiposFixos)
      console.log('Tipos de serviço carregados:', tiposFixos)
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

      // Encontrar o tipo de serviço selecionado para determinar o modelo de cobrança
      const tipoServicoSelecionado = tiposServico.find(ts => ts.id === tipoServicoId)
      const modeloCobranca = tipoServicoSelecionado?.modelo_cobranca || 'painel'

      if (modeloCobranca === 'painel') {
        const override = overrideValorPainel.trim() !== '' ? Number(overrideValorPainel) : null
        const resolvido = await resolverPrecoPainel({
          overrideManual: override,
          equipeId: formData.equipe_id || null,
          empresaId: empresaSelecionada?.id || null,
          tipoServicoId: tipoServicoId || null,
        })
        setFontePreco(resolvido.fonte)
        valor = parseInt(formData.numero_paineis!) * resolvido.valorUnitario
      } else if (modeloCobranca === 'kwp') {
        if (!formData.potencia_painel) {
          toast.error('Para tipos de serviço por kWp, informe a potência do painel')
          return
        }
        // Por kWp: valor por kWp × potência total (resolvido via hierarquia semelhante ao painel)
        const potenciaTotal = (parseInt(formData.numero_paineis!) * parseInt(formData.potencia_painel)) / 1000
        
        console.log('🔍 Calculando valor por kWp:', {
          tipoServicoId,
          empresaId: empresaSelecionada?.id,
          potenciaTotal
        })
        
        const resolvidoKwp = await resolverPrecoKwp({
          overrideManual: null,
          equipeId: formData.equipe_id || null,
          empresaId: empresaSelecionada?.id || null,
          tipoServicoId: tipoServicoId || null,
        })
        
        console.log('💰 Preço kWp resolvido:', resolvidoKwp)
        
        setFontePreco(resolvidoKwp.fonte)
        valor = potenciaTotal * resolvidoKwp.valorUnitario
        
        console.log('🧮 Cálculo final:', { potenciaTotal, valorUnitario: resolvidoKwp.valorUnitario, valor })
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
    
    if (!formData.equipe_id || !formData.cliente_id || !formData.data_execucao) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Validações específicas por tipo de serviço
    const selectedTipo = tiposServico.find(t => t.id === tipoServicoId)
    const validacoes = {
      instalacao: () => {
        console.log('Validando instalação...')
        console.log('Número de painéis:', formData.numero_paineis)
        console.log('Potência do painel:', formData.potencia_painel)
        console.log('Valor calculado:', formData.valor_calculado)
        console.log('Tipo remuneração:', empresaSelecionada?.tipo_remuneracao)
        
        if ((selectedTipo?.exige_quantidade_paineis ?? true) && !formData.numero_paineis) {
          toast.error('Informe o número de painéis')
          return false
        }
        const tipoServicoSelecionado = tiposServico.find(ts => ts.id === tipoServicoId)
        if ((tipoServicoSelecionado?.modelo_cobranca === 'kwp' || tipoServicoSelecionado?.exige_kwp) && !formData.potencia_painel) {
          toast.error('Para tipos de serviço por kWp, informe a potência do painel')
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
      let prevUnitResolved: number | null = null
      let newUnitOverride: number | null = null

      switch (formData.tipo_servico) {
        case 'instalacao':
          valor = formData.valor_calculado || 0
          // Preparar histórico se houver override manual por painel
          if (
            empresaSelecionada?.tipo_remuneracao &&
            (empresaSelecionada.tipo_remuneracao === 'painel' || empresaSelecionada.tipo_remuneracao === 'por_painel') &&
            overrideValorPainel.trim() !== ''
          ) {
            newUnitOverride = Number(overrideValorPainel)
            try {
              const resolved = await resolverPrecoPainel({
                overrideManual: null,
                equipeId: formData.equipe_id || null,
                empresaId: empresaSelecionada?.id || null,
                // tipoServicoId se disponível
                tipoServicoId: (typeof (undefined as any) !== 'undefined' && (undefined as any)) ? (undefined as any) : null
              })
              prevUnitResolved = resolved?.valorUnitario ?? null
            } catch (err) {
              console.warn('Falha ao resolver preço anterior para histórico:', err)
            }
          }
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
        cliente: formData.cliente_id, // Correção: O nome da coluna no banco é 'cliente'
        nome_cliente: formData.cliente_nome, // Adiciona o nome do cliente (denormalizado)
        data_contrato: clienteSelecionado?.data_contrato || null, // Adiciona a data do contrato (denormalizado)
        tipo_servico: formData.tipo_servico,
        data_execucao: formData.data_execucao,
        valor_servico: valor,
        valor_bruto_decimal: valor,
        valor_total_decimal: valor,
        // Só incluir tipo_servico_id se for um UUID real (não mock)
        ...(tipoServicoId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tipoServicoId) 
            ? { tipo_servico_id: tipoServicoId } 
            : {})
      }

      // Log para debug
      console.log('Dados do lançamento:', lancamentoData)
      console.log('Campos do lancamentoData:', Object.keys(lancamentoData))
      console.log('Verificando se há campo cliente:', 'cliente' in lancamentoData)

      // Adicionar campos específicos baseados no tipo de serviço
      if (formData.tipo_servico === 'instalacao' && empresaSelecionada) {
        const tipoServicoSelecionado = tiposServico.find(ts => ts.id === tipoServicoId)
        const modeloCobranca = tipoServicoSelecionado?.modelo_cobranca || 'painel'
        
        if (modeloCobranca === 'kwp') {
          // Para tipos de serviço por kWp: armazenar número de painéis e potência
          lancamentoData.numero_paineis = parseInt(formData.numero_paineis!)
          lancamentoData.potencia_painel = parseInt(formData.potencia_painel!)
          lancamentoData.fonte_preco = fontePreco
        } else {
          // Para tipos de serviço por painel: armazenar apenas número de painéis
          lancamentoData.numero_paineis = parseInt(formData.numero_paineis!)
          lancamentoData.valor_unitario_decimal = overrideValorPainel.trim() !== '' ? Number(overrideValorPainel) : undefined
          lancamentoData.fonte_preco = fontePreco
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

      // Registrar histórico de preço se houve override manual
      try {
        const lancId = Array.isArray(data) && data.length > 0 ? data[0]?.id : null
        if (lancId && newUnitOverride !== null) {
          await fetch('/api/precos/historico', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origem: 'lancamento',
              origem_id: String(lancId),
              campo: 'valor_unitario_decimal',
              valor_anterior: prevUnitResolved,
              valor_novo: newUnitOverride,
              alterado_por: 'ui',
            })
          })
        }
      } catch (err) {
        console.warn('Falha ao registrar histórico de preço:', err)
      }

      toast.success('Lançamento cadastrado com sucesso!')
      
      // Limpar formulário
      setFormData({
        equipe_id: '',
        cliente_id: null,
        cliente_nome: '',
        data_execucao: '', // Reseta para vazio
        tipo_servico: 'instalacao',
        valor_calculado: undefined
      })
      setValorCalculado(null)
      setOverrideValorPainel('')
      setTipoServicoId('')
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
                      {(empresaSelecionada.tipo_remuneracao === 'painel' || empresaSelecionada.tipo_remuneracao === 'por_painel') 
                        ? `Por Painel (R$ ${(empresaSelecionada.valor_painel || 90).toFixed(2)})` 
                        : `Por kWp (R$ ${empresaSelecionada.valor_kwp}/kWp)`}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Beneficiário:</span>
                    <span className="ml-2 text-gray-900">{empresaSelecionada.beneficiario_conta}</span>
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
                <AutoCliente 
                  value={formData.cliente_nome} 
                  onSelect={(cliente) => {
                    setClienteSelecionado(cliente as Cliente | null) // Armazena o objeto completo do cliente
                    if (cliente) {
                      setFormData(prev => ({ 
                        ...prev, 
                        cliente_id: cliente.id, 
                        cliente_nome: cliente.nome,
                      }));
                    } else {
                      // Se o cliente for nulo (campo limpo), reseta os dados do cliente no formulário
                      setFormData(prev => ({ 
                        ...prev, 
                        cliente_id: null, 
                        cliente_nome: '',
                      }));
                    }
                  }}
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
                  onChange={(e) => {
                    const novo = e.target.value as TipoServico
                    setFormData(prev => ({ ...prev, tipo_servico: novo }))
                    setTipoServicoId('') // reset registro ao mudar segmento
                  }}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registro (tipos_servico) *</label>
                <select
                  value={tipoServicoId}
                  onChange={(e) => {
                    const id = e.target.value
                    setTipoServicoId(id)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione</option>
                  {tiposServico
                    .filter(ts => {
                      // Filtrar baseado no tipo de serviço selecionado
                      switch (formData.tipo_servico) {
                        case 'instalacao':
                          return ts.codigo === 'instalacao_painel' || ts.codigo === 'instalacao_kwp'
                        case 'aditivo':
                          return ts.codigo === 'aditivo'
                        case 'desconto':
                          return ts.codigo === 'desconto'
                        case 'padrao_entrada':
                          return ts.codigo === 'padrao_entrada'
                        case 'visita_tecnica':
                          return ts.codigo === 'visita_tecnica'
                        case 'obra_civil':
                          return ts.codigo === 'obra_civil'
                        default:
                          return false
                      }
                    })
                    .map(ts => (
                      <option key={ts.id} value={ts.id}>{ts.nome}</option>
                    ))}
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
                    {(() => {
                      const tipoServicoSelecionado = tiposServico.find(ts => ts.id === tipoServicoId)
                      const modeloCobranca = tipoServicoSelecionado?.modelo_cobranca || 'painel'
                      
                      if (modeloCobranca === 'painel') {
                        return `Tipo selecionado: ${tipoServicoSelecionado?.nome} (por painel) - Hierarquia: Manual > Preços por Tipo > Empresa > Global`
                      } else if (modeloCobranca === 'kwp') {
                        return `Tipo selecionado: ${tipoServicoSelecionado?.nome} (por kWp) - Valor por kWp × potência total (painéis × potência ÷ 1000)`
                      } else {
                        return `Aguardando seleção do tipo de serviço para definir modelo de cálculo`
                      }
                    })()}
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
                  
                  {(() => {
                    const tipoServicoSelecionado = tiposServico.find(ts => ts.id === tipoServicoId)
                    return tipoServicoSelecionado?.modelo_cobranca === 'kwp' || tipoServicoSelecionado?.exige_kwp
                  })() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Potência do Painel (Watts) *
                      </label>
                      <input
                        type="number"
                        value={formData.potencia_painel || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, potencia_painel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="550"
                        min="1"
                        required
                      />
                    </div>
                  )}
                  
                  {(empresaSelecionada?.tipo_remuneracao === 'painel' || empresaSelecionada?.tipo_remuneracao === 'por_painel') && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="usarValorOverride"
                        checked={usarValorOverride}
                        onChange={(e) => {
                          setUsarValorOverride(e.target.checked)
                          if (!e.target.checked) {
                            setOverrideValorPainel('')
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="usarValorOverride" className="text-sm font-medium text-gray-700">
                        Inserir valor manual (override)
                      </label>
                    </div>
                  )}

                  {usarValorOverride && (empresaSelecionada?.tipo_remuneracao === 'painel' || empresaSelecionada?.tipo_remuneracao === 'por_painel') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor por painel (override)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={overrideValorPainel}
                        onChange={(e) => setOverrideValorPainel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Informe o valor manual"
                        required={usarValorOverride}
                      />
                    </div>
                  )}

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={calcularValorInstalacao}
                      disabled={calculando || !formData.equipe_id || !formData.numero_paineis || (() => {
                        const tipoServicoSelecionado = tiposServico.find(ts => ts.id === tipoServicoId)
                        return (tipoServicoSelecionado?.modelo_cobranca === 'kwp' || tipoServicoSelecionado?.exige_kwp) && !formData.potencia_painel
                      })()}
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
                        Fonte do preço: <strong>{fontePreco}</strong>
                      </p>
                    )}
                    {(() => {
                      const tipoServicoSelecionado = tiposServico.find(ts => ts.id === tipoServicoId)
                      return (tipoServicoSelecionado?.modelo_cobranca === 'kwp' || tipoServicoSelecionado?.exige_kwp) && formData.potencia_painel && valorCalculado
                    })() && (
                      <p className="text-sm text-green-700 mt-1">
                        {formData.numero_paineis} painéis × {formData.potencia_painel}W = {((parseInt(formData.numero_paineis || '0') * parseInt(formData.potencia_painel || '0')) / 1000).toFixed(2)} kWp × valor/kWp = R$ {valorCalculado?.toFixed(2) || '0.00'}
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