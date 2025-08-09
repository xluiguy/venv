'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabaseClient, type Empresa, type Equipe } from '@/lib/supabase'
import { 
  Building2, 
  Plus, 
  Users,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  FileText,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [expandedEmpresas, setExpandedEmpresas] = useState<Set<string>>(new Set())
  const [showEquipesManagement, setShowEquipesManagement] = useState(false)
  const [editingEquipe, setEditingEquipe] = useState<Equipe | null>(null)
  const [equipeFormData, setEquipeFormData] = useState({
    nome: ''
  })
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    responsavel: '',
    chave_pix: '',
    beneficiario: '',
    tipo_remuneracao: 'por_painel' as 'painel' | 'kwp' | 'por_painel' | 'por_kwp',
    valor_kwp: 0
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      const [empresasResponse, equipesResponse] = await Promise.all([
        supabase.from('empresas').select('*').order('nome'),
        supabase.from('equipes').select('*').order('nome')
      ])

      if (empresasResponse.error) {
        console.error('Erro ao carregar empresas:', empresasResponse.error)
        toast.error('Erro ao carregar empresas')
      } else {
        setEmpresas(empresasResponse.data || [])
      }

      if (equipesResponse.error) {
        console.error('Erro ao carregar equipes:', equipesResponse.error)
        toast.error('Erro ao carregar equipes')
      } else {
        setEquipes(equipesResponse.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const getEquipesPorEmpresa = (empresaId: string) => {
    return equipes.filter(equipe => equipe.empresa_id === empresaId)
  }

  const toggleExpanded = (empresaId: string) => {
    const newExpanded = new Set(expandedEmpresas)
    if (newExpanded.has(empresaId)) {
      newExpanded.delete(empresaId)
    } else {
      newExpanded.add(empresaId)
    }
    setExpandedEmpresas(newExpanded)
  }

  // Funções de gestão de equipes
  const handleEditEquipe = (equipe: Equipe) => {
    setEditingEquipe(equipe)
    setEquipeFormData({
      nome: equipe.nome
    })
  }

  const handleDeleteEquipe = async (equipeId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta equipe? Esta ação também excluirá todos os lançamentos vinculados.')) return

    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Opção 1: Deleção direta (CASCADE DELETE deve funcionar)
      const { error } = await supabase
        .from('equipes')
        .delete()
        .eq('id', equipeId)

      if (error) {
        console.error('Erro ao excluir equipe:', error)
        
        // Opção 2: Deleção manual se CASCADE falhar
        if (error.message.includes('foreign key') || error.message.includes('constraint')) {
          console.log('Tentando deleção manual...')
          
          // Primeiro deletar lançamentos vinculados
          const { error: errorLancamentos } = await supabase
            .from('lancamentos')
            .delete()
            .eq('equipe_id', equipeId)

          if (errorLancamentos) {
            console.error('Erro ao excluir lançamentos:', errorLancamentos)
            toast.error('Erro ao excluir lançamentos vinculados')
            return
          }

          // Depois deletar a equipe
          const { error: errorEquipe } = await supabase
            .from('equipes')
            .delete()
            .eq('id', equipeId)

          if (errorEquipe) {
            console.error('Erro ao excluir equipe:', errorEquipe)
            toast.error('Erro ao excluir equipe')
          } else {
            toast.success('Equipe e lançamentos vinculados excluídos com sucesso!')
            carregarDados()
          }
        } else {
          toast.error('Erro ao excluir equipe')
        }
      } else {
        toast.success('Equipe excluída com sucesso!')
        carregarDados()
      }
    } catch (error) {
      console.error('Erro ao excluir equipe:', error)
      toast.error('Erro ao excluir equipe')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitEquipe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmpresa) return

    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      if (editingEquipe) {
        // Atualizar equipe existente
        const { error } = await supabase
          .from('equipes')
          .update({ nome: equipeFormData.nome })
          .eq('id', editingEquipe.id)

        if (error) {
          console.error('Erro ao atualizar equipe:', error)
          toast.error('Erro ao atualizar equipe')
        } else {
          toast.success('Equipe atualizada com sucesso!')
          setEditingEquipe(null)
          setEquipeFormData({ nome: '' })
          carregarDados()
        }
      } else {
        // Criar nova equipe
        const { error } = await supabase
          .from('equipes')
          .insert([{
            nome: equipeFormData.nome,
            empresa_id: editingEmpresa.id
          }])

        if (error) {
          console.error('Erro ao criar equipe:', error)
          toast.error('Erro ao criar equipe')
        } else {
          toast.success('Equipe criada com sucesso!')
          setEquipeFormData({ nome: '' })
          carregarDados()
        }
      }
    } catch (error) {
      console.error('Erro ao salvar equipe:', error)
      toast.error('Erro ao salvar equipe')
    } finally {
      setLoading(false)
    }
  }

  const resetEquipeForm = () => {
    setEquipeFormData({ nome: '' })
    setEditingEquipe(null)
  }

  // Funções de formatação
  const formatarCNPJ = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara do CNPJ: XX.XXX.XXX/XXXX-XX
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
  }

  const formatarTelefone = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara do telefone: (XX) XXXXX-XXXX
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const formatarValor = (value: string) => {
    // Remove tudo que não é dígito ou ponto
    const numbers = value.replace(/[^\d.]/g, '')
    
    // Garante que só há um ponto decimal
    const parts = numbers.split('.')
    if (parts.length > 2) {
      return `${parts[0]}.${parts.slice(1).join('')}`
    }
    
    return numbers
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCNPJ(e.target.value)
    setFormData({...formData, cnpj: formatted})
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarTelefone(e.target.value)
    setFormData({...formData, telefone: formatted})
  }

  const handleValorKwpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarValor(e.target.value)
    setFormData({...formData, valor_kwp: parseFloat(formatted) || 0})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      const dataToInsert = {
        ...formData,
                                valor_kwp: (formData.tipo_remuneracao === 'kwp' || formData.tipo_remuneracao === 'por_kwp') ? formData.valor_kwp : null
      }

      if (editingEmpresa) {
        const { error } = await supabase
          .from('empresas')
          .update(dataToInsert)
          .eq('id', editingEmpresa.id)

        if (error) {
          console.error('Erro ao atualizar empresa:', error)
          toast.error('Erro ao atualizar empresa')
        } else {
          toast.success('Empresa atualizada com sucesso!')
          setEditingEmpresa(null)
        }
      } else {
        const { error } = await supabase
          .from('empresas')
          .insert([dataToInsert])

        if (error) {
          console.error('Erro ao criar empresa:', error)
          toast.error('Erro ao criar empresa')
        } else {
          toast.success('Empresa criada com sucesso!')
        }
      }

      setShowForm(false)
      resetForm()
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      toast.error('Erro ao salvar empresa')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setFormData({
      nome: empresa.nome,
      cnpj: empresa.cnpj || '',
      endereco: empresa.endereco || '',
      telefone: empresa.telefone || '',
      email: empresa.email || '',
      responsavel: empresa.responsavel,
      chave_pix: empresa.chave_pix,
      beneficiario: empresa.beneficiario,
      tipo_remuneracao: empresa.tipo_remuneracao,
      valor_kwp: empresa.valor_kwp || 0
    })
    setShowForm(true)
  }

  const handleDelete = async (empresaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return

    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', empresaId)

      if (error) {
        console.error('Erro ao excluir empresa:', error)
        toast.error('Erro ao excluir empresa')
      } else {
        toast.success('Empresa excluída com sucesso!')
        carregarDados()
      }
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      toast.error('Erro ao excluir empresa')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      cnpj: '',
      endereco: '',
      telefone: '',
      email: '',
      responsavel: '',
      chave_pix: '',
      beneficiario: '',
      tipo_remuneracao: 'por_painel',
      valor_kwp: 0
    })
    setEditingEmpresa(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      <div className="flex-1 lg:ml-0 lg:pl-8">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestão de Empresas</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Cadastre e gerencie empresas parceiras
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Button
                    onClick={() => {
                      resetForm()
                      setShowForm(true)
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Empresa
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : empresas.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
                <p className="text-gray-500 mb-6">Comece cadastrando sua primeira empresa</p>
                <Button
                  onClick={() => {
                    resetForm()
                    setShowForm(true)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Empresa
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {empresas.map((empresa) => {
                  const equipesEmpresa = getEquipesPorEmpresa(empresa.id)
                  const isExpanded = expandedEmpresas.has(empresa.id)
                  
                  return (
                    <div key={empresa.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-lg font-semibold text-gray-900">{empresa.nome}</h3>
                              <p className="text-sm text-gray-500">{empresa.responsavel}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(empresa)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(empresa.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {empresa.cnpj && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FileText className="w-4 h-4 mr-2 text-gray-400" />
                              {empresa.cnpj}
                            </div>
                          )}
                          
                          {empresa.telefone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {empresa.telefone}
                            </div>
                          )}
                          
                          {empresa.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {empresa.email}
                            </div>
                          )}
                          
                          {empresa.endereco && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {empresa.endereco}
                            </div>
                          )}

                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Responsável:</span>
                            <span className="ml-1">{empresa.responsavel}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Beneficiário:</span>
                            <span className="ml-1">{empresa.beneficiario}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="font-medium">Equipes:</span>
                              <span className="ml-1">{equipesEmpresa.length}</span>
                            </div>
                            <div className="text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                (empresa.tipo_remuneracao === 'painel' || empresa.tipo_remuneracao === 'por_painel')
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {(empresa.tipo_remuneracao === 'painel' || empresa.tipo_remuneracao === 'por_painel') ? 'Por Painel' : 'Por kWp'}
                              </span>
                            </div>
                          </div>

                          {(empresa.tipo_remuneracao === 'kwp' || empresa.tipo_remuneracao === 'por_kwp') && empresa.valor_kwp && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Valor kWp:</span>
                              <span className="ml-1">R$ {empresa.valor_kwp.toLocaleString('pt-BR')}</span>
                            </div>
                          )}

                          {/* Seção de Equipes */}
                          {equipesEmpresa.length > 0 && (
                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <button
                                onClick={() => toggleExpanded(empresa.id)}
                                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
                              >
                                <span>Equipes Cadastradas</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                              
                              {isExpanded && (
                                <div className="mt-3 space-y-2">
                                  {equipesEmpresa.map((equipe) => (
                                    <div key={equipe.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                      <div className="flex items-center">
                                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-700">{equipe.nome}</span>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {equipe.created_at ? new Date(equipe.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {equipesEmpresa.length === 0 && (
                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <div className="text-center py-2">
                                <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Nenhuma equipe cadastrada</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Modal Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowForm(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex">
                  {/* Formulário da Empresa */}
                  <div className="flex-1 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome da Empresa *
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => setFormData({...formData, nome: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Digite o nome da empresa"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CNPJ
                          </label>
                          <input
                            type="text"
                            value={formData.cnpj}
                            onChange={handleCNPJChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone
                          </label>
                          <input
                            type="text"
                            value={formData.telefone}
                            onChange={handleTelefoneChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="empresa@exemplo.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Endereço
                        </label>
                        <input
                          type="text"
                          value={formData.endereco}
                          onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Rua, número, bairro, cidade - UF"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Responsável *
                          </label>
                          <input
                            type="text"
                            value={formData.responsavel}
                            onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nome do responsável"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Beneficiário *
                          </label>
                          <input
                            type="text"
                            value={formData.beneficiario}
                            onChange={(e) => setFormData({...formData, beneficiario: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nome do beneficiário"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chave PIX *
                          </label>
                          <input
                            type="text"
                            value={formData.chave_pix}
                            onChange={(e) => setFormData({...formData, chave_pix: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Chave PIX"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Remuneração *
                          </label>
                          <select
                            value={formData.tipo_remuneracao}
                            onChange={(e) => setFormData({...formData, tipo_remuneracao: e.target.value as 'painel' | 'kwp' | 'por_painel' | 'por_kwp'})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="por_painel">Por Painel</option>
                            <option value="por_kwp">Por kWp</option>
                          </select>
                        </div>
                      </div>

                      {(formData.tipo_remuneracao === 'kwp' || formData.tipo_remuneracao === 'por_kwp') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor por kWp
                          </label>
                          <input
                            type="text"
                            value={formData.valor_kwp || ''}
                            onChange={handleValorKwpChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0,00"
                          />
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Gestão de Equipes */}
                  {editingEmpresa && (
                    <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Equipes</h4>
                        <p className="text-sm text-gray-600">Gerencie as equipes da empresa {editingEmpresa.nome}</p>
                      </div>

                      {/* Formulário para adicionar/editar equipe */}
                      <form onSubmit={handleSubmitEquipe} className="mb-6">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {editingEquipe ? 'Editar Equipe' : 'Nova Equipe'}
                          </label>
                          <input
                            type="text"
                            value={equipeFormData.nome}
                            onChange={(e) => setEquipeFormData({...equipeFormData, nome: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nome da equipe"
                            required
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            {loading ? 'Salvando...' : (editingEquipe ? 'Atualizar' : 'Adicionar')}
                          </Button>
                          {editingEquipe && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetEquipeForm}
                              className="px-3"
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </form>

                      {/* Lista de equipes */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Equipes Cadastradas</h5>
                        <div className="space-y-2">
                          {getEquipesPorEmpresa(editingEmpresa.id).map((equipe) => (
                            <div key={equipe.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-700">{equipe.nome}</span>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditEquipe(equipe)}
                                  className="p-1"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteEquipe(equipe.id)}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {getEquipesPorEmpresa(editingEmpresa.id).length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">Nenhuma equipe cadastrada</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      resetForm()
                      resetEquipeForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? 'Salvando...' : (editingEmpresa ? 'Atualizar' : 'Criar')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}