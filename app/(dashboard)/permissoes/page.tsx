'use client'

import React, { useState, useEffect } from 'react'
import { useIsAdmin } from '@/contexts/RoleContext'
import { Button } from '@/components/ui/button'
import { Shield, Save, RefreshCw, Users, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

// Definir todos os tipos de permissões disponíveis
export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export interface Role {
  id: string
  name: string
  displayName: string
  description: string
  permissions: string[]
}

// Lista completa de permissões
const ALL_PERMISSIONS: Permission[] = [
  // Dashboard e Visualização
  { id: 'dashboard_view', name: 'Visualizar Dashboard', description: 'Acesso à página principal com métricas', category: 'Dashboard' },
  
  // Empresas
  { id: 'empresas_view', name: 'Visualizar Empresas', description: 'Ver lista de empresas', category: 'Empresas' },
  { id: 'empresas_create', name: 'Criar Empresas', description: 'Cadastrar novas empresas', category: 'Empresas' },
  { id: 'empresas_edit', name: 'Editar Empresas', description: 'Modificar dados de empresas', category: 'Empresas' },
  { id: 'empresas_delete', name: 'Excluir Empresas', description: 'Remover empresas do sistema', category: 'Empresas' },
  
  // Equipes
  { id: 'equipes_view', name: 'Visualizar Equipes', description: 'Ver equipes das empresas', category: 'Empresas' },
  { id: 'equipes_manage', name: 'Gerenciar Equipes', description: 'Criar e editar equipes', category: 'Empresas' },
  
  // Lançamentos
  { id: 'lancamentos_view', name: 'Visualizar Lançamentos', description: 'Ver lançamentos financeiros', category: 'Lançamentos' },
  { id: 'lancamentos_create', name: 'Criar Lançamentos', description: 'Cadastrar novos lançamentos', category: 'Lançamentos' },
  { id: 'lancamentos_edit', name: 'Editar Lançamentos', description: 'Modificar lançamentos existentes', category: 'Lançamentos' },
  { id: 'lancamentos_delete', name: 'Excluir Lançamentos', description: 'Remover lançamentos', category: 'Lançamentos' },
  
  // Relatórios
  { id: 'relatorios_view', name: 'Visualizar Relatórios', description: 'Acessar página de relatórios', category: 'Relatórios' },
  { id: 'relatorios_export', name: 'Exportar Relatórios', description: 'Baixar relatórios em CSV/PDF', category: 'Relatórios' },
  { id: 'relatorios_advanced', name: 'Relatórios Avançados', description: 'Filtros avançados e métricas detalhadas', category: 'Relatórios' },
  
  // Medições
  { id: 'medicoes_view', name: 'Visualizar Medições', description: 'Ver demonstrativos de medições', category: 'Medições' },
  { id: 'medicoes_create', name: 'Criar Medições', description: 'Gerar novas medições', category: 'Medições' },
  { id: 'medicoes_export', name: 'Exportar Medições', description: 'Exportar medições em CSV/PDF', category: 'Medições' },
  
  // Clientes
  { id: 'clientes_view', name: 'Visualizar Clientes', description: 'Ver lista de clientes', category: 'Clientes' },
  { id: 'clientes_create', name: 'Criar Clientes', description: 'Cadastrar novos clientes', category: 'Clientes' },
  { id: 'clientes_edit', name: 'Editar Clientes', description: 'Modificar dados de clientes', category: 'Clientes' },
  { id: 'clientes_delete', name: 'Excluir Clientes', description: 'Remover clientes', category: 'Clientes' },
  
  // Histórico
  { id: 'historico_view', name: 'Visualizar Histórico', description: 'Acessar log de alterações', category: 'Auditoria' },
  { id: 'historico_details', name: 'Detalhes do Histórico', description: 'Ver detalhes completos das alterações', category: 'Auditoria' },
  
  // Administração
  { id: 'usuarios_view', name: 'Visualizar Usuários', description: 'Ver lista de usuários', category: 'Administração' },
  { id: 'usuarios_manage', name: 'Gerenciar Usuários', description: 'Criar, editar e excluir usuários', category: 'Administração' },
  { id: 'tipos_servico_view', name: 'Visualizar Tipos de Serviço', description: 'Ver configurações de tipos de serviço', category: 'Administração' },
  { id: 'tipos_servico_manage', name: 'Gerenciar Tipos de Serviço', description: 'Configurar tipos de serviço e preços', category: 'Administração' },
  { id: 'permissoes_manage', name: 'Gerenciar Permissões', description: 'Configurar permissões por role', category: 'Administração' },
  
  // Configurações
  { id: 'precos_view', name: 'Visualizar Preços', description: 'Ver configurações de preços', category: 'Configurações' },
  { id: 'precos_manage', name: 'Gerenciar Preços', description: 'Configurar preços por empresa/tipo', category: 'Configurações' },
]

// Roles padrão do sistema
const DEFAULT_ROLES: Role[] = [
  {
    id: 'administrador',
    name: 'administrador',
    displayName: 'Administrador',
    description: 'Acesso completo ao sistema',
    permissions: ALL_PERMISSIONS.map(p => p.id) // Todas as permissões
  },
  {
    id: 'fiscal',
    name: 'fiscal',
    displayName: 'Fiscal',
    description: 'Supervisão e auditoria',
    permissions: [
      'dashboard_view',
      'empresas_view',
      'lancamentos_view',
      'relatorios_view',
      'relatorios_export',
      'relatorios_advanced',
      'medicoes_view',
      'medicoes_export',
      'clientes_view',
      'historico_view',
      'historico_details',
      'precos_view',
    ]
  },
  {
    id: 'operador',
    name: 'operador',
    displayName: 'Operador',
    description: 'Operações básicas do sistema',
    permissions: [
      'dashboard_view',
      'empresas_view',
      'lancamentos_view',
      'lancamentos_create',
      'lancamentos_edit',
      'relatorios_view',
      'relatorios_export',
      'medicoes_view',
      'clientes_view',
      'clientes_create',
      'clientes_edit',
    ]
  },
  {
    id: 'usuario',
    name: 'usuario',
    displayName: 'Usuário',
    description: 'Acesso básico somente leitura',
    permissions: [
      'dashboard_view',
      'empresas_view',
      'lancamentos_view',
      'relatorios_view',
      'medicoes_view',
      'clientes_view',
    ]
  }
]

export default function PermissoesPage() {
  const isAdmin = useIsAdmin()
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Verificar se é admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    )
  }

  const togglePermission = (roleId: string, permissionId: string) => {
    setRoles(prevRoles => 
      prevRoles.map(role => {
        if (role.id === roleId) {
          const hasPermission = role.permissions.includes(permissionId)
          return {
            ...role,
            permissions: hasPermission 
              ? role.permissions.filter(p => p !== permissionId)
              : [...role.permissions, permissionId]
          }
        }
        return role
      })
    )
  }

  const savePermissions = async () => {
    setSaving(true)
    try {
      // Salvar as permissões no localStorage (pode ser substituído por API)
      localStorage.setItem('system_permissions', JSON.stringify(roles))
      toast.success('Permissões salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar permissões:', error)
      toast.error('Erro ao salvar permissões')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = () => {
    if (confirm('Tem certeza que deseja restaurar as permissões padrão? Todas as alterações serão perdidas.')) {
      setRoles(DEFAULT_ROLES)
      toast.success('Permissões restauradas para o padrão')
    }
  }

  const loadPermissions = () => {
    setLoading(true)
    try {
      const saved = localStorage.getItem('system_permissions')
      if (saved) {
        setRoles(JSON.parse(saved))
        toast.success('Permissões carregadas')
      } else {
        toast.info('Nenhuma configuração salva encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error)
      toast.error('Erro ao carregar permissões')
    } finally {
      setLoading(false)
    }
  }

  // Agrupar permissões por categoria
  const permissionsByCategory = ALL_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Gerenciamento de Permissões
              </h1>
              <p className="text-gray-600 mt-2">Configure as permissões de acesso por role no sistema</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadPermissions}
                disabled={loading}
                className="flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Carregar
              </Button>
              <Button
                variant="outline"
                onClick={resetToDefault}
                className="flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Restaurar Padrão
              </Button>
              <Button
                onClick={savePermissions}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>

        {/* Roles Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{role.displayName}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-blue-700 font-medium">
                  {role.permissions.length} de {ALL_PERMISSIONS.length} permissões
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(role.permissions.length / ALL_PERMISSIONS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions Matrix */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Matriz de Permissões</h2>
            <p className="text-gray-600 mt-1">Configure quais permissões cada role possui</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-80">
                    Permissão
                  </th>
                  {roles.map(role => (
                    <th key={role.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                      {role.displayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                  const categoryRows = []
                  
                  // Category Header
                  categoryRows.push(
                    <tr key={`category-${category}`} className="bg-gray-100">
                      <td colSpan={roles.length + 1} className="px-6 py-3">
                        <div className="font-semibold text-gray-900 flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                          {category}
                        </div>
                      </td>
                    </tr>
                  )
                  
                  // Permissions rows
                  permissions.forEach(permission => {
                    categoryRows.push(
                      <tr key={permission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{permission.name}</div>
                            <div className="text-sm text-gray-500">{permission.description}</div>
                          </div>
                        </td>
                        {roles.map(role => (
                          <td key={role.id} className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={role.permissions.includes(permission.id)}
                              onChange={() => togglePermission(role.id, permission.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  })
                  
                  return categoryRows
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exemplo de uso do sistema */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Como usar o sistema de permissões</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Defina permissões:</strong> Configure quais actions cada role pode executar</p>
            <p><strong>2. Use nos componentes:</strong> Importe <code className="bg-blue-100 px-1 rounded">usePermissions</code> ou <code className="bg-blue-100 px-1 rounded">PermissionGuard</code></p>
            <p><strong>3. Proteja rotas:</strong> Envolva conteúdo com <code className="bg-blue-100 px-1 rounded">&lt;PermissionGuard permission="empresas_create"&gt;</code></p>
            <p><strong>4. Botões condicionais:</strong> Use <code className="bg-blue-100 px-1 rounded">hasPermission('usuarios_manage')</code> para mostrar/ocultar elementos</p>
          </div>
        </div>

        {/* Save Button Fixed */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={savePermissions}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 shadow-lg flex items-center px-6 py-3"
          >
            <Save className={`w-5 h-5 mr-2 ${saving ? 'animate-pulse' : ''}`} />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  )
}
