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
  Activity,
  Menu,
  X,
  Calendar
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: BarChart3,
    description: 'Demonstrativo financeiro'
  },
  { 
    name: 'Empresas', 
    href: '/empresas', 
    icon: Building2,
    description: 'Gestão de empresas'
  },
  { 
    name: 'Lançamentos', 
    href: '/lancamentos', 
    icon: Plus,
    description: 'Controle de lançamentos'
  },
  { 
    name: 'Relatórios', 
    href: '/relatorios', 
    icon: FileText,
    description: 'Relatórios financeiros'
  },
  { 
    name: 'Medições', 
    href: '/medicoes', 
    icon: Calendar,
    description: 'Medições salvas'
  },
  { 
    name: 'Logs', 
    href: '/logs', 
    icon: Activity,
    description: 'Sistema de auditoria'
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Resolve Finance</h1>
                <p className="text-sm text-gray-500">Flow System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-4 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  )}
                >
                  <item.icon className={cn(
                    'w-5 h-5 mr-4 transition-colors duration-200',
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2024 Resolve Energia Solar
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 