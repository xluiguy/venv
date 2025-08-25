'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Shield, AlertTriangle } from 'lucide-react'

interface PermissionGuardProps {
  permission: string | string[]
  fallback?: ReactNode
  children: ReactNode
  requireAll?: boolean // Se true, requer todas as permissões; se false, requer ao menos uma
}

export function PermissionGuard({ 
  permission, 
  fallback, 
  children, 
  requireAll = false 
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading } = usePermissions()

  // Mostrar loading enquanto carrega permissões
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Verificando permissões...</span>
      </div>
    )
  }

  let hasAccess = false

  if (Array.isArray(permission)) {
    // Múltiplas permissões
    hasAccess = requireAll ? hasAllPermissions(permission) : hasAnyPermission(permission)
  } else {
    // Permissão única
    hasAccess = hasPermission(permission)
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    // Fallback padrão
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Acesso Restrito</h3>
          <p className="text-gray-600 text-sm">
            Você não tem permissão para acessar este conteúdo.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook para usar em componentes condicionais
export function usePermissionGuard(permission: string | string[], requireAll = false) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading } = usePermissions()

  if (loading) return { hasAccess: false, loading: true }

  let hasAccess = false
  if (Array.isArray(permission)) {
    hasAccess = requireAll ? hasAllPermissions(permission) : hasAnyPermission(permission)
  } else {
    hasAccess = hasPermission(permission)
  }

  return { hasAccess, loading: false }
}

// Componente para botões condicionais
interface ConditionalButtonProps {
  permission: string | string[]
  requireAll?: boolean
  children: ReactNode
  fallback?: ReactNode
}

export function ConditionalButton({ 
  permission, 
  requireAll = false, 
  children, 
  fallback = null 
}: ConditionalButtonProps) {
  const { hasAccess } = usePermissionGuard(permission, requireAll)
  
  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Componente para alertas de permissão
interface PermissionAlertProps {
  permission: string
  title?: string
  message?: string
}

export function PermissionAlert({ 
  permission, 
  title = 'Funcionalidade Limitada', 
  message 
}: PermissionAlertProps) {
  const { hasAccess } = usePermissionGuard(permission)
  
  if (hasAccess) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
        <div>
          <h4 className="text-sm font-medium text-yellow-800">{title}</h4>
          <p className="text-sm text-yellow-700 mt-1">
            {message || 'Você não tem permissão para usar todas as funcionalidades desta página.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PermissionGuard
