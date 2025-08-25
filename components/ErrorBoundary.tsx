'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger-simple';
import { config } from '@/lib/config'

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro
    logger.captureError(error, 'React Error Boundary');
    logger.error('React Error Info', {
      componentStack: errorInfo.componentStack,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }, 'React');

    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback customizado ou padrão
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Algo deu errado
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Ocorreu um erro inesperado. Nossa equipe foi notificada.
              </p>
              
              {config.app.isDevelopment && this.state.error && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md">
                  <strong className="font-bold">Erro:</strong>
                  <span className="block sm:inline">{this.state.error.toString()}</span>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                    window.location.reload();
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar o Error Boundary em componentes funcionais
export const useErrorBoundary = () => {
  const handleError = (error: Error, errorInfo?: any) => {
    logger.captureError(error, 'React Component Error');
    if (errorInfo) {
      logger.error('React Error Info', errorInfo, 'React');
    }
  };

  return { handleError };
};

export default ErrorBoundary; 