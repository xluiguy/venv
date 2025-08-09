'use client'

import React, { useState, useEffect, useRef } from 'react';
import { LogLevel, LogEntry } from '@/lib/logger';

interface LogViewerProps {
  maxLogs?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function LogViewer({ 
  maxLogs = 100, 
  autoRefresh = true, 
  refreshInterval = 5000 
}: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/logs');
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs || []);
      } else {
        setError('Erro ao carregar logs');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao buscar logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    if (autoRefresh) {
      autoRefreshRef.current = setInterval(fetchLogs, refreshInterval);
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const filteredLogs = logs
    .filter(log => filter === 'ALL' || log.level === filter)
    .filter(log => 
      search === '' || 
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.context?.toLowerCase().includes(search.toLowerCase())
    )
    .slice(-maxLogs);

  const getLogLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return 'text-red-600 bg-red-50 border-red-200';
      case LogLevel.WARN:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case LogLevel.INFO:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case LogLevel.DEBUG:
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case LogLevel.TRACE:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getLogStats = () => {
    const stats = {
      total: logs.length,
      error: logs.filter(log => log.level === LogLevel.ERROR).length,
      warn: logs.filter(log => log.level === LogLevel.WARN).length,
      info: logs.filter(log => log.level === LogLevel.INFO).length,
      debug: logs.filter(log => log.level === LogLevel.DEBUG).length,
      trace: logs.filter(log => log.level === LogLevel.TRACE).length,
    };

    return stats;
  };

  const stats = getLogStats();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Visualizador de Logs</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Carregando...' : 'Atualizar'}
          </button>
          <button
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.error}</div>
          <div className="text-sm text-red-600">Erros</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.warn}</div>
          <div className="text-sm text-yellow-600">Warnings</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
          <div className="text-sm text-blue-600">Info</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{stats.debug}</div>
          <div className="text-sm text-gray-600">Debug</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.trace}</div>
          <div className="text-sm text-purple-600">Trace</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Nível:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogLevel | 'ALL')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="ALL">Todos</option>
            <option value={LogLevel.ERROR}>Erro</option>
            <option value={LogLevel.WARN}>Warning</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.DEBUG}>Debug</option>
            <option value={LogLevel.TRACE}>Trace</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Buscar:</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar em mensagens..."
            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-64"
          />
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
        {error && (
          <div className="text-red-600 text-center py-4">{error}</div>
        )}

        {filteredLogs.length === 0 && !error && (
          <div className="text-gray-500 text-center py-4">
            Nenhum log encontrado
          </div>
        )}

        <div className="space-y-2">
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getLogLevelColor(log.level)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium px-2 py-1 rounded">
                      {log.level}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    {log.context && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {log.context}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium">{log.message}</div>
                  {log.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-600">
                        Dados adicionais
                      </summary>
                      <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Mostrando {filteredLogs.length} de {logs.length} logs
        {autoRefresh && ` • Atualização automática a cada ${refreshInterval / 1000}s`}
      </div>
    </div>
  );
} 