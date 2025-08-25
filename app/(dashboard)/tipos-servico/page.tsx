'use client'

import { useState, useEffect } from 'react'
import { useIsAdmin } from '@/contexts/RoleContext'

import toast from 'react-hot-toast'

type TipoServico = {
  id: string
  nome: string
  codigo: string
  descricao: string
  modelo_cobranca: 'painel' | 'kwp'
  valor_unitario: number | null
  ativo: boolean
}

export default function TiposServicoPage() {
  const [tipos, setTipos] = useState<TipoServico[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin, isLoading: roleLoading } = useIsAdmin()

  useEffect(() => {
    if (!roleLoading) {
      carregarTipos()
    }
  }, [roleLoading, isAdmin])

  const carregarTipos = async () => {
    setLoading(true)
    
    try {
      if (!isAdmin) {
        toast.error('Você não tem permissão para gerenciar tipos de serviço.')
        setLoading(false)
        return
      }

      console.log('🔧 Tipos Serviço: Carregando dados com role em cache (administrador)')

      const tiposFixos: TipoServico[] = [
        // Serviços de Instalação - valores definidos pela empresa
        {
          id: 'instalacao_painel',
          nome: 'Instalação (por painel)',
          codigo: 'instalacao_painel',
          descricao: 'Serviço de instalação de sistema solar fotovoltaico cobrado por painel instalado. Valor definido pela empresa.',
          modelo_cobranca: 'painel',
          valor_unitario: null,
          ativo: true
        },
        {
          id: 'instalacao_kwp',
          nome: 'Instalação (por kWp)',
          codigo: 'instalacao_kwp', 
          descricao: 'Serviço de instalação de sistema solar fotovoltaico cobrado por kWp de potência. Valor definido pela empresa.',
          modelo_cobranca: 'kwp',
          valor_unitario: null,
          ativo: true
        },
        
        // Tipos de Serviço Auxiliares - valores definidos no orçamento
        {
          id: 'aditivo',
          nome: 'Aditivo',
          codigo: 'aditivo',
          descricao: 'Valor adicional aplicado ao orçamento principal por solicitações extras. Valor definido no orçamento.',
          modelo_cobranca: 'painel',
          valor_unitario: null,
          ativo: true
        },
        {
          id: 'desconto',
          nome: 'Desconto',
          codigo: 'desconto',
          descricao: 'Valor de desconto aplicado ao orçamento total. Valor definido no orçamento.',
          modelo_cobranca: 'painel',
          valor_unitario: null,
          ativo: true
        },
        {
          id: 'obra_civil',
          nome: 'Obra Civil',
          codigo: 'obra_civil',
          descricao: 'Serviços de obra civil necessários para a instalação do sistema solar. Valor definido no orçamento.',
          modelo_cobranca: 'painel',
          valor_unitario: null,
          ativo: true
        },
        {
          id: 'padrao_entrada',
          nome: 'Padrão de Entrada',
          codigo: 'padrao_entrada',
          descricao: 'Adequação ou instalação do padrão de entrada elétrica. Valor definido no orçamento.',
          modelo_cobranca: 'painel',
          valor_unitario: null,
          ativo: true
        },
        {
          id: 'visita_tecnica',
          nome: 'Visita Técnica',
          codigo: 'visita_tecnica',
          descricao: 'Visita técnica para avaliação do local e dimensionamento do sistema. Valor definido no orçamento.',
          modelo_cobranca: 'painel',
          valor_unitario: null,
          ativo: true
        }
      ]

      setTipos(tiposFixos)
      
      console.log('✅ Tipos Serviço: Dados carregados com sucesso')
      
    } catch (error) {
      console.error("❌ Tipos Serviço: Erro ao carregar:", error)
      toast.error('Erro ao carregar tipos de serviço.')
    } finally {
      setLoading(false)
    }
  }



  // Mostrar loading enquanto carrega role ou dados
  if (roleLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">
          {roleLoading ? 'Verificando permissões...' : 'Carregando tipos de serviço...'}
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
          <p className="text-gray-600">Você não tem permissão para gerenciar tipos de serviço.</p>
          <p className="text-sm text-gray-500 mt-2">Apenas administradores podem visualizar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 lg:ml-0 lg:pl-8">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tipos de Serviço</h1>
                <p className="mt-2 text-gray-600">Gerencie os tipos de serviço de instalação solar.</p>
              </div>
              <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                ⚡ Dados carregados instantaneamente (role em cache)
              </div>
            </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tipos.map((tipo) => (
              <div key={tipo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{tipo.nome}</h3>
                      {tipo.valor_unitario < 0 && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          Desconto
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {tipo.codigo}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {tipo.modelo_cobranca === 'painel' ? 'Por Painel' : 'Por kWp'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tipo.descricao}</p>
                  </div>
                  
                                    <div className="border-t border-gray-100 pt-4">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-800 rounded-full text-sm">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span className="font-medium">
                          {tipo.codigo.startsWith('instalacao') 
                            ? 'Valor definido pela empresa' 
                            : 'Valor definido no orçamento'
                          }
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {tipo.codigo.startsWith('instalacao')
                          ? 'Valores de instalação são configurados no cadastro da empresa'
                          : 'Este tipo de serviço não possui valor padrão fixo'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}







