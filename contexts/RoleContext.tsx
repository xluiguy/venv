'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'

interface RoleContextType {
  userRole: string | null
  isLoading: boolean
  refreshRole: () => Promise<void>
  clearRole: () => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

const ROLE_CACHE_KEY = 'user_role_cache'
const ROLE_CACHE_EXPIRY = 'user_role_cache_expiry'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutos em millisegundos

interface RoleCacheData {
  role: string
  userId: string
  email: string
  timestamp: number
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Função para verificar se o cache é válido
  const isCacheValid = (cacheData: RoleCacheData, currentUserId: string): boolean => {
    const now = Date.now()
    const isExpired = now > cacheData.timestamp + CACHE_DURATION
    const isSameUser = cacheData.userId === currentUserId
    
    return !isExpired && isSameUser
  }

  // Função para carregar role do cache ou do servidor
  const loadUserRole = async () => {
    setIsLoading(true)
    
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('🚫 RoleContext: Usuário não logado')
        setUserRole(null)
        setIsLoading(false)
        return
      }

      console.log('🔍 RoleContext: Verificando cache para usuário:', user.email)

      // Verificar cache primeiro
      const cachedData = localStorage.getItem(ROLE_CACHE_KEY)
      if (cachedData) {
        try {
          const parsedCache: RoleCacheData = JSON.parse(cachedData)
          
          if (isCacheValid(parsedCache, user.id)) {
            console.log('✅ RoleContext: Cache válido encontrado:', parsedCache.role)
            setUserRole(parsedCache.role)
            setIsLoading(false)
            return
          } else {
            console.log('⏰ RoleContext: Cache expirado ou usuário diferente, removendo...')
            localStorage.removeItem(ROLE_CACHE_KEY)
            localStorage.removeItem(ROLE_CACHE_EXPIRY)
          }
        } catch (error) {
          console.log('❌ RoleContext: Erro ao parsear cache, removendo...')
          localStorage.removeItem(ROLE_CACHE_KEY)
          localStorage.removeItem(ROLE_CACHE_EXPIRY)
        }
      }

      // Se chegou aqui, precisa buscar do servidor
      console.log('🌐 RoleContext: Buscando role do servidor...')
      
      let role = 'operador' // padrão
      
      // Para xavierluiguy@gmail.com, sempre administrador
      if (user.email === 'xavierluiguy@gmail.com') {
        role = 'administrador'
        console.log('👑 RoleContext: Administrador identificado pelo email')
      } else {
        // Para outros usuários, tentar buscar na tabela profiles
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (profileData?.role) {
            role = profileData.role
            console.log('📊 RoleContext: Role encontrado na tabela:', role)
          }
        } catch (error) {
          console.log('⚠️ RoleContext: Erro ao buscar profiles, usando role padrão')
        }
      }

      // Salvar no cache
      const cacheData: RoleCacheData = {
        role,
        userId: user.id,
        email: user.email || '',
        timestamp: Date.now()
      }
      
      localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(cacheData))
      console.log('💾 RoleContext: Role salvo no cache:', role)
      
      setUserRole(role)
      
    } catch (error) {
      console.error('❌ RoleContext: Erro ao carregar role:', error)
      setUserRole('operador')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para forçar refresh do role
  const refreshRole = async () => {
    console.log('🔄 RoleContext: Forçando refresh do role...')
    // Limpar cache
    localStorage.removeItem(ROLE_CACHE_KEY)
    localStorage.removeItem(ROLE_CACHE_EXPIRY)
    // Recarregar
    await loadUserRole()
  }

  // Função para limpar role (logout)
  const clearRole = () => {
    console.log('🧹 RoleContext: Limpando role e cache...')
    localStorage.removeItem(ROLE_CACHE_KEY)
    localStorage.removeItem(ROLE_CACHE_EXPIRY)
    setUserRole(null)
  }

  // Carregar role na inicialização
  useEffect(() => {
    loadUserRole()
  }, [])

  const value: RoleContextType = {
    userRole,
    isLoading,
    refreshRole,
    clearRole
  }

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  )
}

// Hook para usar o contexto
export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole deve ser usado dentro de um RoleProvider')
  }
  return context
}

// Hook para verificar se é administrador
export function useIsAdmin() {
  const { userRole, isLoading } = useRole()
  return {
    isAdmin: userRole === 'administrador',
    isLoading
  }
}
