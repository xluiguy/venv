import { useState, useEffect, useCallback } from 'react'
import { useRole } from '@/contexts/RoleContext'

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

// Permissões padrão por role
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  administrador: [
    'dashboard_view',
    'empresas_view', 'empresas_create', 'empresas_edit', 'empresas_delete',
    'equipes_view', 'equipes_manage',
    'lancamentos_view', 'lancamentos_create', 'lancamentos_edit', 'lancamentos_delete',
    'relatorios_view', 'relatorios_export', 'relatorios_advanced',
    'medicoes_view', 'medicoes_create', 'medicoes_export',
    'clientes_view', 'clientes_create', 'clientes_edit', 'clientes_delete',
    'historico_view', 'historico_details',
    'usuarios_view', 'usuarios_manage',
    'tipos_servico_view', 'tipos_servico_manage',
    'permissoes_manage',
    'precos_view', 'precos_manage'
  ],
  fiscal: [
    'dashboard_view',
    'empresas_view',
    'lancamentos_view',
    'relatorios_view', 'relatorios_export', 'relatorios_advanced',
    'medicoes_view', 'medicoes_export',
    'clientes_view',
    'historico_view', 'historico_details',
    'precos_view'
  ],
  operador: [
    'dashboard_view',
    'empresas_view',
    'lancamentos_view', 'lancamentos_create', 'lancamentos_edit',
    'relatorios_view', 'relatorios_export',
    'medicoes_view',
    'clientes_view', 'clientes_create', 'clientes_edit'
  ],
  usuario: [
    'dashboard_view',
    'empresas_view',
    'lancamentos_view',
    'relatorios_view',
    'medicoes_view',
    'clientes_view'
  ]
}

export function usePermissions() {
  const { userRole } = useRole()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadPermissions = useCallback(async () => {
    if (!userRole) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Tentar carregar permissões personalizadas do localStorage
      const savedPermissions = localStorage.getItem('system_permissions')
      
      if (savedPermissions) {
        const parsedPermissions: Role[] = JSON.parse(savedPermissions)
        const roleConfig = parsedPermissions.find(r => r.name === userRole)
        
        if (roleConfig) {
          setPermissions(roleConfig.permissions)
        } else {
          // Fallback para permissões padrão
          setPermissions(DEFAULT_PERMISSIONS[userRole] || [])
        }
      } else {
        // Usar permissões padrão
        setPermissions(DEFAULT_PERMISSIONS[userRole] || [])
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error)
      // Fallback para permissões padrão em caso de erro
      setPermissions(DEFAULT_PERMISSIONS[userRole] || [])
    } finally {
      setLoading(false)
    }
  }, [userRole])

  useEffect(() => {
    loadPermissions()
  }, [loadPermissions])

  const hasPermission = useCallback((permissionId: string): boolean => {
    return permissions.includes(permissionId)
  }, [permissions])

  const hasAnyPermission = useCallback((permissionIds: string[]): boolean => {
    return permissionIds.some(id => permissions.includes(id))
  }, [permissions])

  const hasAllPermissions = useCallback((permissionIds: string[]): boolean => {
    return permissionIds.every(id => permissions.includes(id))
  }, [permissions])

  // Shortcuts para permissões comuns
  const canView = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}_view`)
  }, [hasPermission])

  const canCreate = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}_create`)
  }, [hasPermission])

  const canEdit = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}_edit`)
  }, [hasPermission])

  const canDelete = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}_delete`)
  }, [hasPermission])

  const canManage = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}_manage`)
  }, [hasPermission])

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManage,
    reload: loadPermissions
  }
}

export default usePermissions
