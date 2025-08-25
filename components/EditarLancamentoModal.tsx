'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Lancamento {
  id: string
  equipe_id: string | null
  cliente: string
  data_contrato: string | null
  tipo_servico: string
  numero_paineis: number | null
  potencia_painel: number | null
  valor_servico: number
  tipo_aditivo: string | null
  motivo_desconto: string | null
  tipo_padrao: string | null
  motivo_visita: string | null
  descricao_material: string | null
  motivo_obra: string | null
  created_at: string | null
  updated_at: string | null
  data_execucao: string | null
  valor_unitario_decimal: number | null
  valor_bruto_decimal: number | null
  aditivo_decimal: number | null
  desconto_decimal: number | null
  valor_total_decimal: number | null
  fonte_preco: string | null
  tipo_servico_id: string | null
  cliente_id: string | null
  nome_cliente: string | null
}

interface Equipe {
  id: string
  empresa_id: string | null
  nome: string
  valor_por_kwp_decimal: number | null
  valor_por_painel_decimal: number | null
  created_at: string | null
  updated_at: string | null
}

interface EditarLancamentoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (dados: Partial<Lancamento>) => void
  lancamento: Lancamento | null
}

export function EditarLancamentoModal({ isOpen, onClose, onSave, lancamento }: EditarLancamentoModalProps) {
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [formData, setFormData] = useState({
    equipe_id: '',
    nome_cliente: '',
    data_execucao: '',
    tipo_servico: '',
    tipo_aditivo: '',
    motivo_desconto: '',
    tipo_padrao_entrada: '',
    motivo_visita: '',
    motivo_obra: '',
    valor_servico: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      carregarEquipes()
    }
  }, [isOpen])

  useEffect(() => {
    if (lancamento) {
      setFormData({
        equipe_id: lancamento.equipe_id,
        nome_cliente: lancamento.nome_cliente,
        data_execucao: lancamento.data_execucao ? new Date(lancamento.data_execucao).toISOString().split('T')[0] : '',
        tipo_servico: lancamento.tipo_servico,
        tipo_aditivo: lancamento.tipo_aditivo || '',
        motivo_desconto: lancamento.motivo_desconto || '',
        tipo_padrao_entrada: lancamento.tipo_padrao_entrada || '',
        motivo_visita: lancamento.motivo_visita || '',
        motivo_obra: lancamento.motivo_obra || '',
        valor_servico: lancamento.valor_servico
      })
    }
  }, [lancamento])

  const carregarEquipes = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('equipes')
        .select('*')
        .order('nome')

      if (error) throw error
      setEquipes(data || [])
    } catch (error) {
      console.error('Erro ao carregar equipes:', error)
      toast.error('Erro ao carregar equipes')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dadosAtualizados = {
        equipe_id: formData.equipe_id,
        nome_cliente: formData.nome_cliente,
        data_execucao: formData.data_execucao || null,
        tipo_servico: formData.tipo_servico,
        tipo_aditivo: formData.tipo_aditivo || null,
        motivo_desconto: formData.motivo_desconto || null,
        tipo_padrao_entrada: formData.tipo_padrao_entrada || null,
        motivo_visita: formData.motivo_visita || null,
        motivo_obra: formData.motivo_obra || null,
        valor_servico: formData.valor_servico
      }

      await onSave(dadosAtualizados)
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Editar Lançamento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Equipe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipe *
              </label>
              <select
                value={formData.equipe_id}
                onChange={(e) => handleInputChange('equipe_id', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Selecione uma equipe</option>
                {equipes.map(equipe => (
                  <option key={equipe.id} value={equipe.id}>
                    {equipe.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <input
                type="text"
                value={formData.nome_cliente}
                onChange={(e) => handleInputChange('nome_cliente', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Data de Execução */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Execução
              </label>
              <input
                type="date"
                value={formData.data_execucao}
                onChange={(e) => handleInputChange('data_execucao', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Tipo de Serviço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Serviço *
              </label>
              <select
                value={formData.tipo_servico}
                onChange={(e) => handleInputChange('tipo_servico', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Selecione o tipo</option>
                <option value="instalacao">Instalação</option>
                <option value="aditivo">Aditivo</option>
                <option value="desconto">Desconto</option>
                <option value="visita">Visita</option>
                <option value="obra">Obra</option>
              </select>
            </div>

            {/* Valor do Serviço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor do Serviço *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valor_servico}
                onChange={(e) => handleInputChange('valor_servico', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Campos condicionais baseados no tipo de serviço */}
          {formData.tipo_servico === 'aditivo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Aditivo
              </label>
              <input
                type="text"
                value={formData.tipo_aditivo}
                onChange={(e) => handleInputChange('tipo_aditivo', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: Material adicional, serviço extra..."
              />
            </div>
          )}

          {formData.tipo_servico === 'desconto' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo do Desconto
              </label>
              <input
                type="text"
                value={formData.motivo_desconto}
                onChange={(e) => handleInputChange('motivo_desconto', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: Promoção, pagamento antecipado..."
              />
            </div>
          )}

          {formData.tipo_servico === 'instalacao' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Padrão de Entrada
              </label>
              <input
                type="text"
                value={formData.tipo_padrao_entrada}
                onChange={(e) => handleInputChange('tipo_padrao_entrada', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: Padrão residencial, comercial..."
              />
            </div>
          )}

          {formData.tipo_servico === 'visita' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo da Visita
              </label>
              <input
                type="text"
                value={formData.motivo_visita}
                onChange={(e) => handleInputChange('motivo_visita', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: Manutenção, vistoria..."
              />
            </div>
          )}

          {formData.tipo_servico === 'obra' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo da Obra
              </label>
              <input
                type="text"
                value={formData.motivo_obra}
                onChange={(e) => handleInputChange('motivo_obra', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: Reforma, ampliação..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
