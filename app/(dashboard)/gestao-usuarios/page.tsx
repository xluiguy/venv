'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Edit, ShieldCheck, ShieldOff, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useIsAdmin } from '@/contexts/RoleContext'

interface Profile {
  id: string
  role: 'administrador' | 'fiscal' | 'operador' | 'usuario'
  ativo: boolean
  user: {
    email: string
    created_at: string
  } | null
}

export default function GestaoUsuariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin, isLoading: roleLoading } = useIsAdmin()

  useEffect(() => {
    // Só buscar usuários quando o role estiver carregado
    if (!roleLoading) {
      fetchProfiles()
    }
  }, [roleLoading, isAdmin])

  const fetchProfiles = async () => {
    setLoading(true)
    
    try {
      // Verificar se o usuário é administrador usando o cache
      if (!isAdmin) {
        toast.error('Você não tem permissão para ver os usuários.')
        setLoading(false)
        return
      }

      console.log('👥 Gestão Usuários: Carregando usuários reais do Supabase...')

      const supabase = getSupabaseClient()
      
      // DEBUG: Verificar status da sessão
      const { data: session, error: sessionError } = await supabase.auth.getSession()
      console.log('🔐 Sessão atual:', { session: !!session?.session, error: sessionError })
      
      // Buscar profiles da tabela profiles
      const { data: profilesData, error: profilesError } = await (supabase as any)
        .from('profiles')
        .select(`
          id,
          role,
          email,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('❌ Erro ao buscar profiles:')
        console.error('  Código:', profilesError.code)
        console.error('  Mensagem:', profilesError.message)
        console.error('  Detalhes:', profilesError.details)
        console.error('  Hint:', profilesError.hint)
        console.error('  Status:', (profilesError as any).status)
        
        // Se houver erro, mostrar lista vazia em vez de dados de exemplo
        console.log('❌ Falha ao carregar usuários do banco de dados')
        setProfiles([])
        toast.error(`Erro ${(profilesError as any).status || 'desconhecido'} ao acessar banco de dados`)
        return
      }

      // Transformar dados do Supabase para o formato esperado
      const profilesFormatted: Profile[] = profilesData.map((profile: any) => ({
        id: profile.id,
        role: profile.role as Profile['role'],
        ativo: true, // Por enquanto, todos são considerados ativos
        user: {
          email: profile.email || 'Email não informado',
          created_at: profile.created_at
        }
      }))

      setProfiles(profilesFormatted)
      console.log(`✅ Gestão Usuários: ${profilesFormatted.length} usuários carregados do Supabase`)
      toast.success(`${profilesFormatted.length} usuários carregados com sucesso`)
      
    } catch (error) {
      console.error("❌ Gestão Usuários: Erro catch geral:", error)
      toast.error('Erro inesperado ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (profile: Profile) => {
    const novoStatus = !profile.ativo
    try {
      const supabase = getSupabaseClient()
      
      // Por enquanto, apenas alteração local já que não temos campo 'ativo' na tabela
      const updatedProfiles = profiles.map(p => 
        p.id === profile.id ? { ...p, ativo: novoStatus } : p
      )
      setProfiles(updatedProfiles)
      
      toast.success(`Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`)
      console.log('✅ Status alterado para:', profile.user?.email, '→', novoStatus ? 'Ativo' : 'Inativo')
      console.log('ℹ️ Nota: Alteração apenas local (campo ativo não existe na tabela)')
    } catch (error) {
      toast.error('Falha ao alterar o status do usuário.')
      console.error('Erro ao alterar status:', error)
    }
  }

  const changeUserRole = async (profile: Profile, newRole: Profile['role']) => {
    try {
      const supabase = getSupabaseClient()
      
      // Atualizar role no banco de dados
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
      
      if (error) {
        console.error('❌ Erro ao atualizar role no banco:', error)
        toast.error('Falha ao alterar o papel do usuário no banco de dados.')
        return
      }
      
      // Atualizar estado local
      const updatedProfiles = profiles.map(p => 
        p.id === profile.id ? { ...p, role: newRole } : p
      )
      setProfiles(updatedProfiles)
      
      toast.success('Papel do usuário alterado com sucesso!')
      console.log('✅ Role alterado para:', profile.user?.email, '→', newRole)
    } catch (error) {
      toast.error('Falha ao alterar o papel do usuário.')
      console.error('Erro ao alterar papel:', error)
    }
  }

  // Mostrar loading enquanto carrega role ou dados
  if (roleLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">
          {roleLoading ? 'Verificando permissões...' : 'Carregando usuários...'}
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
          <p className="text-gray-600">Você não tem permissão para gerenciar usuários.</p>
          <p className="text-sm text-gray-500 mt-2">Apenas administradores podem visualizar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 lg:ml-0 lg:pl-8">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
                <p className="mt-2 text-gray-600">Gerencie os usuários e suas permissões no sistema.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchProfiles}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  📊 Dados carregados do Supabase
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Papel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{profile.user?.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(profile.user?.created_at || '').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={profile.role}
                        onChange={(e) => changeUserRole(profile, e.target.value as Profile['role'])}
                        className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="administrador">Administrador</option>
                        <option value="fiscal">Fiscal</option>
                        <option value="operador">Operador</option>
                        <option value="usuario">Usuário</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          profile.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {profile.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(profile)}
                      >
                        {profile.ativo ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {profile.ativo ? 'Desativar' : 'Ativar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

