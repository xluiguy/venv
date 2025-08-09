'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface SalvarMedicaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (nome: string) => Promise<void>
  filtros: {
    data_inicio: string
    data_fim: string
    equipes: string[]
    cliente: string
  }
  resumo: {
    total_lancamentos: number
    total_clientes: number
    total_valor: number
  }
}

export function SalvarMedicaoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  filtros, 
  resumo 
}: SalvarMedicaoModalProps) {
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error('Por favor, insira um nome para a medição')
      return
    }

    setLoading(true)
    try {
      await onSave(nome.trim())
      setNome('')
      onClose()
      toast.success('Medição salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar medição:', error)
      toast.error('Erro ao salvar medição')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNome('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Salvar Medição
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Medição *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Medição Janeiro 2024"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Resumo da Medição
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Período:</span>
                <span className="text-gray-900">
                  {filtros.data_inicio && filtros.data_fim 
                    ? `${new Date(filtros.data_inicio).toLocaleDateString('pt-BR')} - ${new Date(filtros.data_fim).toLocaleDateString('pt-BR')}`
                    : 'Todos os períodos'
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lançamentos:</span>
                <span className="text-gray-900">{resumo.total_lancamentos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Clientes:</span>
                <span className="text-gray-900">{resumo.total_clientes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor Total:</span>
                <span className="text-gray-900 font-medium">
                  R$ {resumo.total_valor.toFixed(2)}
                </span>
              </div>
              {filtros.cliente && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cliente filtrado:</span>
                  <span className="text-gray-900">{filtros.cliente}</span>
                </div>
              )}
              {filtros.equipes.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Equipes filtradas:</span>
                  <span className="text-gray-900">{filtros.equipes.length} equipe(s)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !nome.trim()}
              className="flex-1 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Medição'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
