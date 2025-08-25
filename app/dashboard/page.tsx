'use client'

export default function DashboardPage() {
  return (
    <div className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bem-vindo ao Resolve Finance!</h3>
          <p className="text-gray-600 mb-4">
            Este é o seu painel de controle. Use o menu lateral para navegar pelas funcionalidades.
          </p>
          <p className="text-green-600 font-medium">✅ Você está logado com sucesso!</p>
        </div>
      </div>
    </div>
  )
} 