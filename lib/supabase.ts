import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase - PROJETO CORRETO
const supabaseUrl = 'https://fjyhxzjzobkuvwdqdtld.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeWh4emp6b2JrdXZ3ZHFkdGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTIzMDksImV4cCI6MjA2OTg4ODMwOX0.2GuNZxA4VGUkMPhfthzwn__AeWtGvCGkm1RB8NKbMVo'

// Função para criar o cliente Supabase apenas quando necessário
export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: true,
    },
    global: {
      headers: {
        'Accept-Profile': 'public',
        'Content-Profile': 'public'
      },
    },
  })
}

// Função para obter o cliente Supabase
export function getSupabaseClient() {
  return createSupabaseClient()
}

// Interfaces TypeScript - CORRIGIDAS para corresponder ao schema real
export interface Empresa {
  id: string
  nome: string
  cnpj?: string
  endereco?: string
  telefone?: string
  email?: string
  responsavel: string
  chave_pix: string
  beneficiario: string
  tipo_remuneracao: 'painel' | 'kwp' | 'por_painel' | 'por_kwp'
  valor_kwp?: number
  created_at?: string
  updated_at?: string
}

export interface Equipe {
  id: string
  empresa_id: string
  nome: string
  created_at?: string
  updated_at?: string
}

// Interface Medicao - CORRIGIDA para corresponder ao schema real
export interface Medicao {
  id: string
  empresa_id: string
  data_medicao: string
  total_clientes: number
  total_paineis: number
  valor_total: number
  observacoes?: string
  created_at?: string
  updated_at?: string
}

// Interface Lancamento - CORRIGIDA para corresponder ao schema real
export interface Lancamento {
  id: string
  equipe_id: string
  cliente: string
  data_contrato: string
  data_execucao?: string
  tipo_servico: string
  numero_paineis?: number
  potencia_painel?: number
  valor_servico: number
  tipo_aditivo?: string
  motivo_desconto?: string
  tipo_padrao?: string
  motivo_visita?: string
  descricao_material?: string
  motivo_obra?: string
  created_at?: string
  updated_at?: string
}

// Interface DemonstrativoItem - CORRIGIDA para corresponder ao schema real
export interface DemonstrativoItem {
  id: string
  medicao_id: string
  empresa_id: string
  tipo_item: 'desconto' | 'adicional' | 'padrao'
  descricao: string
  valor: number
  created_at?: string
}

// Interface DemonstrativoFinanceiro - CORRIGIDA para corresponder à view real
export interface DemonstrativoFinanceiro {
  empresa_id: string
  empresa: string
  responsavel: string
  tipo_remuneracao: string
  valor_kwp?: number
  total_clientes: number
  total_paineis: number
  valor_total: number
  data_medicao?: string
  medicao_id?: string
}

// Interface RelatorioFinanceiro - CORRIGIDA
export interface RelatorioFinanceiro {
  empresa_id: string
  empresa: string
  total_receitas: number
  total_despesas: number
  total_liquido: number
  total_medicoes: number
  total_paineis: number
  total_clientes: number
  total_descontos: number
  total_aditivos: number
  total_geral: number
}

// Interfaces para compatibilidade com código existente (DEPRECATED)
// Estas serão removidas após correção completa do sistema

export interface MedicaoLegacy {
  id: string
  numero: string
  data_inicio: string
  data_fim: string
  status: 'aberta' | 'fechada'
  created_at: string
}

export interface LancamentoLegacy {
  id: string
  equipe_id: string
  medicao_id: string
  cliente: string
  data_contrato: string
  tipo_servico: 'instalacao' | 'aditivo' | 'desconto' | 'padrao_entrada' | 'visita_tecnica' | 'obra_civil'
  subitem_servico?: string
  valor: number
  descricao?: string
  created_at: string
}

export interface DemonstrativoItemLegacy {
  empresa_id: string
  nome_empresa: string
  contagem_clientes: number
  total_paineis: number
  valor_padrao_entrada: number
  valor_configuracao: number
  subtotal: number
  total_descontos: number
  total_aditivos: number
} 