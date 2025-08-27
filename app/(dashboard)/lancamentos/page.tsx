'use client'

import { useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'

interface Lancamento {
  id: string
  descricao: string
  valor: number
  tipo: 'receita' | 'despesa'
  data: string
  cliente_id: string
  empresa_id: string
  created_at: string
}

export default function LancamentosPage() {
  const { hasPermission } = usePermissions()
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<string>('')

  useEffect(() => {
    fetchLancamentos()
  }, [])

  const fetchLancamentos = async () => {
    try {
      const response = await fetch('/api/lancamentos')
      if (response.ok) {
        const data = await response.json()
        setLancamentos(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLancamentos = lancamentos.filter(lancamento => {
    const matchesSearch = lancamento.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = !filterTipo || lancamento.tipo === filterTipo
    return matchesSearch && matchesTipo
  })

  const totalReceitas = filteredLancamentos
    .filter(l => l.tipo === 'receita')
    .reduce((sum, l) => sum + l.valor, 0)

  const totalDespesas = filteredLancamentos
    .filter(l => l.tipo === 'despesa')
    .reduce((sum, l) => sum + l.valor, 0)

  const saldo = totalReceitas - totalDespesas

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando lançamentos...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
        {hasPermission('lancamentos', 'create') && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Lançamento
          </Button>
        )}
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-800">Total Receitas</div>
          <div className="text-2xl font-bold text-green-600">
            R$ {totalReceitas.toFixed(2)}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm font-medium text-red-800">Total Despesas</div>
          <div className="text-2xl font-bold text-red-600">
            R$ {totalDespesas.toFixed(2)}
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${
          saldo >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="text-sm font-medium text-gray-800">Saldo</div>
          <div className={`text-2xl font-bold ${
            saldo >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            R$ {saldo.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-4 h-4" />
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLancamentos.map((lancamento) => (
              <tr key={lancamento.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {lancamento.descricao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={lancamento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                    R$ {lancamento.valor.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    lancamento.tipo === 'receita' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {hasPermission('lancamentos', 'update') && (
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {hasPermission('lancamentos', 'delete') && (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLancamentos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum lançamento encontrado.
        </div>
      )}
    </div>
  )
}
