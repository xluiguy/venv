'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import LogViewer from '@/components/LogViewer'
import { setupGlobalErrorHandling } from '@/lib/logger-simple'

export default function LogsPage() {
  useEffect(() => {
    // Configurar captura global de erros
    setupGlobalErrorHandling();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 lg:ml-0 lg:pl-8">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Logs
            </h1>
            <p className="mt-2 text-gray-600">
              Visualize e monitore os logs do sistema em tempo real
            </p>
          </div>

          <LogViewer 
            maxLogs={200}
            autoRefresh={true}
            refreshInterval={3000}
          />

          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Sistema de Logs
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Funcionalidades</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Captura automática de erros</li>
                  <li>• Logs de operações de banco de dados</li>
                  <li>• Logs de requisições API</li>
                  <li>• Logs de autenticação</li>
                  <li>• Logs de performance</li>
                  <li>• Logs de negócio</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Níveis de Log</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><span className="font-medium text-red-600">ERROR</span> - Erros críticos</li>
                  <li><span className="font-medium text-yellow-600">WARN</span> - Avisos</li>
                  <li><span className="font-medium text-blue-600">INFO</span> - Informações gerais</li>
                  <li><span className="font-medium text-gray-600">DEBUG</span> - Debug detalhado</li>
                  <li><span className="font-medium text-purple-600">TRACE</span> - Rastreamento completo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 