// Sistema de Logs Completo para Next.js
// Suporte para frontend e backend

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  stack?: string;
  duration?: number;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxFileSize: number;
  maxFiles: number;
  logDirectory: string;
}

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private bufferSize = 10;
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private name: string,
    config?: Partial<LoggerConfig>
  ) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false, // Desabilitado no frontend
      enableRemote: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      logDirectory: './logs',
      ...config
    };

    // Inicializar flush automático
    this.startAutoFlush();
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    context?: string
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || this.name,
      data,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    // Adicionar informações de sessão se disponível
    if (typeof window !== 'undefined') {
      entry.sessionId = this.getSessionId();
    }

    return entry;
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('app_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('app_session_id', sessionId);
    }
    return sessionId;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const { timestamp, level, message, context, data } = entry;
    const prefix = `[${timestamp}] [${level}] [${context}]`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${message}`, data || '');
        break;
      case LogLevel.TRACE:
        console.trace(`${prefix} ${message}`, data || '');
        break;
    }
  }

  private async logToFile(entry: LogEntry): Promise<void> {
    // Só executa no servidor (Node.js)
    if (!this.config.enableFile || typeof window !== 'undefined') return;
    
    try {
      // Verifica se estamos no servidor antes de importar módulos Node.js
      if (typeof process === 'undefined' || !process.versions?.node) {
        return; // Não está no servidor Node.js
      }

      const fs = await import('fs');
      const path = await import('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
      
      // Cria diretório se não existir
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logLine = `${entry.timestamp} [${entry.level}] [${entry.context}] ${entry.message}${entry.data ? ` | ${JSON.stringify(entry.data)}` : ''}\n`;
      
      fs.appendFileSync(logFile, logLine);
      
      // Rotação de logs (mantém apenas os últimos 7 dias)
      this.rotateLogs(logDir);
    } catch (error) {
      // Se falhar ao escrever no arquivo, apenas loga no console
      console.error('Erro ao escrever log no arquivo:', error);
    }
  }

  private rotateLogs(logDir: string): void {
    try {
      if (typeof process === 'undefined' || !process.versions?.node) return;
      
      const fs = require('fs');
      const path = require('path');
      
      const files = fs.readdirSync(logDir);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      files.forEach((file: string) => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < sevenDaysAgo) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Erro na rotação de logs:', error);
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote) return;

    try {
      // Enviar para API de logs remota
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Erro ao enviar log remoto:', error);
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    if (this.logBuffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  private startAutoFlush(): void {
    if (typeof window !== 'undefined') return; // Apenas no servidor
    
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 5000); // Flush a cada 5 segundos
  }

  private flush(): void {
    if (this.logBuffer.length === 0) return;

    const entries = [...this.logBuffer];
    this.logBuffer = [];

    // Processar logs em lote
    entries.forEach(entry => {
      this.logToConsole(entry);
      this.logToFile(entry);
      this.logToRemote(entry);
    });
  }

  // Métodos públicos de log
  error(message: string, data?: any, context?: string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, data, context);
    this.addToBuffer(entry);
  }

  warn(message: string, data?: any, context?: string): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, data, context);
    this.addToBuffer(entry);
  }

  info(message: string, data?: any, context?: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, data, context);
    this.addToBuffer(entry);
  }

  debug(message: string, data?: any, context?: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data, context);
    this.addToBuffer(entry);
  }

  trace(message: string, data?: any, context?: string): void {
    if (!this.shouldLog(LogLevel.TRACE)) return;
    
    const entry = this.createLogEntry(LogLevel.TRACE, message, data, context);
    this.addToBuffer(entry);
  }

  // Métodos específicos para diferentes contextos
  api(method: string, url: string, status: number, duration: number, data?: any): void {
    this.info(`API ${method} ${url}`, {
      method,
      url,
      status,
      duration,
      data
    }, 'API');
  }

  database(operation: string, table: string, data?: any, error?: any): void {
    if (error) {
      this.error(`Database ${operation} on ${table}`, { operation, table, data, error }, 'Database');
    } else {
      this.info(`Database ${operation} on ${table}`, { operation, table, data }, 'Database');
    }
  }

  auth(action: string, success: boolean, userId?: string, data?: any): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const entry = this.createLogEntry(level, `Auth ${action}`, { action, userId, success, data }, 'Auth');
    this.addToBuffer(entry);
  }

  business(action: string, entity: string, data?: any): void {
    this.info(`Business ${action} on ${entity}`, { action, entity, data }, 'Business');
  }

  performance(operation: string, duration: number, data?: any): void {
    this.info(`Performance ${operation}`, { operation, duration, data }, 'Performance');
  }

  // Método para capturar erros não tratados
  captureError(error: Error, context?: string): void {
    this.error(error.message, {
      name: error.name,
      stack: error.stack,
      context
    }, 'ErrorCapture');
  }

  // Método para finalizar o logger
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Instâncias de logger para diferentes contextos
export const loggers = {
  app: new Logger('App', { level: LogLevel.INFO }),
  api: new Logger('API', { level: LogLevel.INFO }),
  database: new Logger('Database', { level: LogLevel.INFO }),
  auth: new Logger('Auth', { level: LogLevel.INFO }),
  business: new Logger('Business', { level: LogLevel.INFO }),
  performance: new Logger('Performance', { level: LogLevel.INFO }),
  error: new Logger('Error', { level: LogLevel.ERROR }),
};

// Logger principal
export const logger = loggers.app;

// Hook para capturar erros no React
export const useErrorBoundary = () => {
  const handleError = (error: Error, errorInfo: any) => {
    logger.captureError(error, 'React Error Boundary');
    logger.error('React Error Info', errorInfo, 'React');
  };

  return { handleError };
};

// Middleware para Next.js
export const loggerMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    loggers.api.info(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
};

// Função para configurar captura global de erros
export const setupGlobalErrorHandling = () => {
  if (typeof window !== 'undefined') {
    // Capturar erros não tratados no frontend
    window.addEventListener('error', (event) => {
      logger.captureError(event.error || new Error(event.message), 'Global Error');
    });

    // Capturar promessas rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      }, 'Global Error');
    });
  }
};

export default Logger; 