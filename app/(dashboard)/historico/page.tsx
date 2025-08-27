'use client'

import { useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Search, Filter, Download } from 'lucide-react'

interface HistoricoItem {
  id: string
  acao: string
  tabela: string
  registro_id: string
  dados_anteriores: any
  dados_novos: any
  usuario_id: string
  created_at: string
}

export default function HistoricoPage() {
  const { hasPermission } = usePermissions()
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTabela, setFilterTabela] = useState<string>('')

  useEffect(() => {
    fetchHistorico()
  }, [])

  const fetchHistorico = async () => {
    try {
      const response = await fetch('/api/historico')
      if (response.ok) {
        const data = await response.json()
        setHistorico(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistorico = historico.filter(item => {
    const matchesSearch = item.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tabela.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTabela = !filterTabela || item.tabela === filterTabela
    return matchesSearch && matchesTabela
  })

  const tabelasUnicas = [...new Set(historico.map(item => item.tabela))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando histórico...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Alterações</h1>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por ação ou tabela..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-4 h-4" />
          <select
            value={filterTabela}
            onChange={(e) => setFilterTabela(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as tabelas</option>
            {tabelasUnicas.map(tabela => (
              <option key={tabela} value={tabela}>{tabela}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tabela
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registro ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHistorico.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.acao === 'INSERT' ? 'bg-green-100 text-green-800' :
                    item.acao === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.acao}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.tabela}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.registro_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.usuario_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredHistorico.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum registro de histórico encontrado.
        </div>
      )}
    </div>
  )
}
