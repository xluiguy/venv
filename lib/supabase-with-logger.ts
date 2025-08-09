import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loggers } from './logger';

// Wrapper do Supabase com logging integrado
export class SupabaseWithLogger {
  private client: SupabaseClient;
  private logger = loggers.database;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
    this.logger.info('Supabase client initialized', { url });
  }

  // Wrapper para operações de tabela
  from(tableName: string) {
    return new TableWrapper(this.client, tableName, this.logger);
  }

  // Métodos diretos do cliente
  get auth() {
    return this.client.auth;
  }

  get storage() {
    return this.client.storage;
  }

  get functions() {
    return this.client.functions;
  }

  get realtime() {
    return this.client.realtime;
  }

  // Log de conexão
  async testConnection() {
    try {
      const start = Date.now();
      const { data, error } = await this.client.from('empresas').select('count').limit(1);
      const duration = Date.now() - start;

      if (error) {
        this.logger.error('Connection test failed', { error, duration });
        return { success: false, error, duration };
      }

      this.logger.info('Connection test successful', { duration });
      return { success: true, data, duration };
    } catch (error) {
      this.logger.error('Connection test exception', { error });
      return { success: false, error };
    }
  }
}

// Wrapper para operações de tabela
class TableWrapper {
  private table: any;
  private logger = loggers.database;

  constructor(
    private client: SupabaseClient,
    private tableName: string,
    private tableLogger: any
  ) {
    this.table = this.client.from(tableName);
  }

  // SELECT
  select(columns?: string) {
    this.logger.debug(`SELECT ${columns || '*'} from ${this.tableName}`);
    this.table = this.table.select(columns);
    return this;
  }

  // INSERT
  async insert(data: any) {
    const start = Date.now();
    this.logger.info(`INSERT into ${this.tableName}`, { data });

    try {
      const result = await this.table.insert(data);
      const duration = Date.now() - start;

      if (result.error) {
        this.logger.error(`INSERT failed on ${this.tableName}`, {
          error: result.error,
          data,
          duration
        });
      } else {
        this.logger.info(`INSERT successful on ${this.tableName}`, {
          count: result.data?.length || 0,
          duration
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.logger.error(`INSERT exception on ${this.tableName}`, {
        error,
        data,
        duration
      });
      throw error;
    }
  }

  // UPDATE
  async update(data: any) {
    const start = Date.now();
    this.logger.info(`UPDATE on ${this.tableName}`, { data });

    try {
      const result = await this.table.update(data);
      const duration = Date.now() - start;

      if (result.error) {
        this.logger.error(`UPDATE failed on ${this.tableName}`, {
          error: result.error,
          data,
          duration
        });
      } else {
        this.logger.info(`UPDATE successful on ${this.tableName}`, {
          count: result.data?.length || 0,
          duration
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.logger.error(`UPDATE exception on ${this.tableName}`, {
        error,
        data,
        duration
      });
      throw error;
    }
  }

  // DELETE
  async delete() {
    const start = Date.now();
    this.logger.info(`DELETE from ${this.tableName}`);

    try {
      const result = await this.table.delete();
      const duration = Date.now() - start;

      if (result.error) {
        this.logger.error(`DELETE failed on ${this.tableName}`, {
          error: result.error,
          duration
        });
      } else {
        this.logger.info(`DELETE successful on ${this.tableName}`, {
          count: result.data?.length || 0,
          duration
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.logger.error(`DELETE exception on ${this.tableName}`, {
        error,
        duration
      });
      throw error;
    }
  }

  // Filtros
  eq(column: string, value: any) {
    this.logger.debug(`Filter: ${column} = ${value} on ${this.tableName}`);
    this.table = this.table.eq(column, value);
    return this;
  }

  neq(column: string, value: any) {
    this.logger.debug(`Filter: ${column} != ${value} on ${this.tableName}`);
    this.table = this.table.neq(column, value);
    return this;
  }

  gt(column: string, value: any) {
    this.logger.debug(`Filter: ${column} > ${value} on ${this.tableName}`);
    this.table = this.table.gt(column, value);
    return this;
  }

  gte(column: string, value: any) {
    this.logger.debug(`Filter: ${column} >= ${value} on ${this.tableName}`);
    this.table = this.table.gte(column, value);
    return this;
  }

  lt(column: string, value: any) {
    this.logger.debug(`Filter: ${column} < ${value} on ${this.tableName}`);
    this.table = this.table.lt(column, value);
    return this;
  }

  lte(column: string, value: any) {
    this.logger.debug(`Filter: ${column} <= ${value} on ${this.tableName}`);
    this.table = this.table.lte(column, value);
    return this;
  }

  like(column: string, value: string) {
    this.logger.debug(`Filter: ${column} LIKE ${value} on ${this.tableName}`);
    this.table = this.table.like(column, value);
    return this;
  }

  ilike(column: string, value: string) {
    this.logger.debug(`Filter: ${column} ILIKE ${value} on ${this.tableName}`);
    this.table = this.table.ilike(column, value);
    return this;
  }

  in(column: string, values: any[]) {
    this.logger.debug(`Filter: ${column} IN [${values.join(', ')}] on ${this.tableName}`);
    this.table = this.table.in(column, values);
    return this;
  }

  // Ordenação
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.logger.debug(`Order: ${column} on ${this.tableName}`, options);
    this.table = this.table.order(column, options);
    return this;
  }

  // Limitação
  limit(count: number) {
    this.logger.debug(`Limit: ${count} on ${this.tableName}`);
    this.table = this.table.limit(count);
    return this;
  }

  // Execução da query
  async execute() {
    const start = Date.now();
    this.logger.debug(`Executing query on ${this.tableName}`);

    try {
      const result = await this.table;
      const duration = Date.now() - start;

      if (result.error) {
        this.logger.error(`Query failed on ${this.tableName}`, {
          error: result.error,
          duration
        });
      } else {
        this.logger.info(`Query successful on ${this.tableName}`, {
          count: result.data?.length || 0,
          duration
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.logger.error(`Query exception on ${this.tableName}`, {
        error,
        duration
      });
      throw error;
    }
  }

  // Para compatibilidade com a API do Supabase
  async then(resolve: any, reject: any) {
    try {
      const result = await this.execute();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }
}

// Função para criar cliente com logging
export function createSupabaseWithLogger(url: string, key: string): SupabaseWithLogger {
  return new SupabaseWithLogger(url, key);
}

// Função para obter cliente com logging (compatível com a função existente)
export function getSupabaseWithLogger() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and Anon Key are required');
  }

  return createSupabaseWithLogger(url, key);
} 