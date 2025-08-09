'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Building2, 
  FileText, 
  Plus,
  Settings,
  Activity,
  Calendar
} from 'lucide-react'

const navigation = [
  { name: 'Demonstrativo', href: '/', icon: BarChart3 },
  { name: 'Empresas', href: '/empresas', icon: Building2 },
  { name: 'Lançamentos', href: '/lancamentos', icon: Plus },
  { name: 'Relatórios', href: '/relatorios', icon: FileText },
  { name: 'Medições', href: '/medicoes', icon: Calendar },
  { name: 'Logs', href: '/logs', icon: Activity },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Resolve Finance Flow
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                      isActive
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 