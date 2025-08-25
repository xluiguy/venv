'use client'

import React, { memo, useMemo } from 'react'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'
import { usePermissions } from '@/hooks/usePermissions'
import { getSupabaseClient } from '@/lib/supabaseClient'

interface MenuItem {
  href: string
  icon: string
  label: string
  roles?: string[]
  permission?: string // Nova: permissão específica necessária
}

interface DashboardSidebarProps {
  className?: string
}

const DashboardSidebar = memo(function DashboardSidebar({ className = '' }: DashboardSidebarProps) {
  const { userRole, isLoading, clearRole } = useRole()
  const { hasPermission, loading: permissionsLoading } = usePermissions()

  // Debug: mostrar quando o componente re-renderiza
  console.log('🎨 Sidebar: Componente renderizado com role:', userRole, 'loading:', isLoading)

  // Memoizar a lista de itens do menu baseado no role
  const menuItems = useMemo(() => {
    console.log('🔄 Sidebar: Recalculando menu items para role:', userRole)
    
    const baseItems: MenuItem[] = [
      { href: '/', icon: '📊', label: 'Dashboard', permission: 'dashboard_view' },
      { href: '/empresas', icon: '🏢', label: 'Empresas', permission: 'empresas_view' },
      { href: '/lancamentos', icon: '➕', label: 'Lançamentos', permission: 'lancamentos_view' },
      { href: '/relatorios', icon: '📈', label: 'Relatórios', permission: 'relatorios_view' },
      { href: '/medicoes', icon: '📋', label: 'Medições', permission: 'medicoes_view' },
      { href: '/clientes', icon: '👥', label: 'Clientes', permission: 'clientes_view' },
    ]

    const privilegedItems: MenuItem[] = [
      { href: '/historico', icon: '📜', label: 'Histórico', permission: 'historico_view', roles: ['administrador', 'fiscal'] },
    ]

    const adminItems: MenuItem[] = [
      { href: '/gestao-usuarios', icon: '👨‍💼', label: 'Gestão de Usuários', permission: 'usuarios_view', roles: ['administrador'] },
      { href: '/tipos-servico', icon: '🔧', label: 'Tipos de Serviço', permission: 'tipos_servico_view', roles: ['administrador'] },
      { href: '/permissoes', icon: '🔐', label: 'Permissões', permission: 'permissoes_manage', roles: ['administrador'] },
    ]

    // Filtrar itens baseado no role e permissões
    const allItems = [...baseItems, ...privilegedItems, ...adminItems]
    
    const filteredItems = allItems.filter(item => {
      // Se tem permissão específica, verificar ela
      if (item.permission && !permissionsLoading) {
        return hasPermission(item.permission)
      }
      
      // Fallback para roles (compatibilidade)
      if (!item.roles) return true // Item público
      return userRole && item.roles.includes(userRole)
    })

    console.log('✅ Sidebar: Menu calculado com', filteredItems.length, 'itens para role:', userRole)
    return filteredItems
  }, [userRole, hasPermission, permissionsLoading]) // Recalcula quando role ou permissões mudam

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    clearRole() // Limpar cache de role
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 p-4 flex flex-col ${className}`}>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Resolve Finance</h2>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                {item.icon} {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botão de logout no final */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="mb-2 text-xs text-gray-500">
          Role: {isLoading ? 'Carregando...' : (userRole || 'Não definido')}
          {!isLoading && userRole && (
            <span className="ml-2 text-green-600">✓ Cache</span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
        >
          🚪 Sair
        </button>
      </div>
    </aside>
  )
})

export default DashboardSidebar
