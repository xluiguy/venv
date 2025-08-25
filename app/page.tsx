'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirecionar para o dashboard - o middleware cuidará da autenticação
    router.replace('/dashboard')
  }, [router])

  // Página de loading simples enquanto redireciona
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Resolve Finance Flow
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Redirecionando para o login...
          </p>
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
