'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  Plus,
  BarChart2,
  FileText,
  Users,
  GitBranch,
  LogOut,
  Users2,
  History
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const navLinks = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Empresas', href: '/empresas', icon: Building2 },
  { name: 'Lançamentos', href: '/lancamentos', icon: Plus },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart2 },
  { name: 'Medições', href: '/medicoes', icon: FileText },
  { name: 'Clientes', href: '/clientes', icon: Users },
]

// Hook para buscar o perfil do usuário
function useUserProfile() {
  const [profile, setProfile] = useState<{ role: string } | null>(null)
  
  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileData) setProfile(profileData)
      }
    }
    
    fetchProfile()
  }, [])
  
  return profile
}


export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const userProfile = useUserProfile()

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-white sm:flex">
      <nav className="flex flex-col gap-4 p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="">Resolve Finance</span>
        </Link>
        <ul className="flex flex-1 flex-col gap-1">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 ${
                  pathname === link.href ? 'bg-gray-100 text-gray-900' : ''
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            </li>
          ))}
          {(userProfile?.role === 'administrador' || userProfile?.role === 'fiscal') && (
            <li>
              <Link
                href="/historico"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 ${
                  pathname === '/historico' ? 'bg-gray-100 text-gray-900' : ''
                }`}
              >
                <History className="h-4 w-4" />
                Histórico
              </Link>
            </li>
          )}
          {userProfile?.role === 'administrador' && (
            <li>
              <Link
                href="/gestao-usuarios"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 ${
                  pathname === '/gestao-usuarios' ? 'bg-gray-100 text-gray-900' : ''
                }`}
              >
                <Users2 className="h-4 w-4" />
                Gestão de Usuários
              </Link>
            </li>
          )}
        </ul>
        <div className="mt-auto p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </nav>
    </aside>
  )
} 