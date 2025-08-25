export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          ativo: boolean
          created_at: string
          data_contrato: string | null
          documento: string | null
          email: string | null
          empresa_id: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_contrato?: string | null
          documento?: string | null
          email?: string | null
          empresa_id?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_contrato?: string | null
          documento?: string | null
          email?: string | null
          empresa_id?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "demonstrativo_financeiro"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "relatorio_medicao_por_data"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "relatorio_por_data"
            referencedColumns: ["empresa_id"]
          },
        ]
      }
      configuracoes_precos: {
        Row: {
          atualizado_por: string | null
          chave: string
          created_at: string
          id: string
          updated_at: string
          valor_decimal: number
          vigente_ate: string | null
          vigente_desde: string
        }
        Insert: {
          atualizado_por?: string | null
          chave: string
          created_at?: string
          id?: string
          updated_at?: string
          valor_decimal: number
          vigente_ate?: string | null
          vigente_desde?: string
        }
        Update: {
          atualizado_por?: string | null
          chave?: string
          created_at?: string
          id?: string
          updated_at?: string
          valor_decimal?: number
          vigente_ate?: string | null
          vigente_desde?: string
        }
        Relationships: []
      }
      empresas: {
        Row: {
          beneficiario_conta: string | null
          chave_pix: string | null
          created_at: string | null
          id: string
          nome: string
          responsavel: string
          tipo_remuneracao: string
          updated_at: string | null
          valor_kwp: number | null
        }
        Insert: {
          beneficiario_conta?: string | null
          chave_pix?: string | null
          created_at?: string | null
          id?: string
          nome: string
          responsavel: string
          tipo_remuneracao: string
          updated_at?: string | null
          valor_kwp?: number | null
        }
        Update: {
          beneficiario_conta?: string | null
          chave_pix?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          responsavel?: string
          tipo_remuneracao?: string
          updated_at?: string | null
          valor_kwp?: number | null
        }
        Relationships: []
      }
      equipes: {
        Row: {
          created_at: string | null
          empresa_id: string | null
          id: string
          nome: string
          updated_at: string | null
          valor_por_kwp_decimal: number | null
          valor_por_painel_decimal: number | null
        }
        Insert: {
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          valor_por_kwp_decimal?: number | null
          valor_por_painel_decimal?: number | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          valor_por_kwp_decimal?: number | null
          valor_por_painel_decimal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "demonstrativo_financeiro"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "equipes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "relatorio_medicao_por_data"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "equipes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "relatorio_por_data"
            referencedColumns: ["empresa_id"]
          },
        ]
      }
      historico_precos: {
        Row: {
          alterado_em: string
          alterado_por: string | null
          campo: string
          id: string
          origem: string
          origem_id: string | null
          valor_anterior: number | null
          valor_novo: number | null
        }
        Insert: {
          alterado_em?: string
          alterado_por?: string | null
          campo: string
          id?: string
          origem: string
          origem_id?: string | null
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Update: {
          alterado_em?: string
          alterado_por?: string | null
          campo?: string
          id?: string
          origem?: string
          origem_id?: string | null
          valor_anterior?: number | null
          valor_novo?: number | null
        }
        Relationships: []
      }
      lancamentos: {
        Row: {
          aditivo_decimal: number | null
          cliente: string
          cliente_id: string | null
          created_at: string | null
          data_contrato: string | null
          data_execucao: string | null
          desconto_decimal: number | null
          descricao_material: string | null
          equipe_id: string | null
          fonte_preco: string | null
          id: string
          motivo_desconto: string | null
          motivo_obra: string | null
          motivo_visita: string | null
          nome_cliente: string | null
          numero_paineis: number | null
          potencia_painel: number | null
          tipo_aditivo: string | null
          tipo_padrao: string | null
          tipo_servico: string
          tipo_servico_id: string | null
          updated_at: string | null
          valor_bruto_decimal: number | null
          valor_servico: number
          valor_total_decimal: number | null
          valor_unitario_decimal: number | null
        }
        Insert: {
          aditivo_decimal?: number | null
          cliente: string
          cliente_id?: string | null
          created_at?: string | null
          data_contrato?: string | null
          data_execucao?: string | null
          desconto_decimal?: number | null
          descricao_material?: string | null
          equipe_id?: string | null
          fonte_preco?: string | null
          id?: string
          motivo_desconto?: string | null
          motivo_obra?: string | null
          motivo_visita?: string | null
          nome_cliente?: string | null
          numero_paineis?: number | null
          potencia_painel?: number | null
          tipo_aditivo?: string | null
          tipo_padrao?: string | null
          tipo_servico: string
          tipo_servico_id?: string | null
          updated_at?: string | null
          valor_bruto_decimal?: number | null
          valor_servico: number
          valor_total_decimal?: number | null
          valor_unitario_decimal?: number | null
        }
        Update: {
          aditivo_decimal?: number | null
          cliente?: string
          cliente_id?: string | null
          created_at?: string | null
          data_contrato?: string | null
          data_execucao?: string | null
          desconto_decimal?: number | null
          descricao_material?: string | null
          equipe_id?: string | null
          fonte_preco?: string | null
          id?: string
          motivo_desconto?: string | null
          motivo_obra?: string | null
          motivo_visita?: string | null
          nome_cliente?: string | null
          numero_paineis?: number | null
          potencia_painel?: number | null
          tipo_aditivo?: string | null
          tipo_padrao?: string | null
          tipo_servico?: string
          tipo_servico_id?: string | null
          updated_at?: string | null
          valor_bruto_decimal?: number | null
          valor_servico?: number
          valor_total_decimal?: number | null
          valor_unitario_decimal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_lancamentos_cliente_id"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "relatorio_medicao_por_data"
            referencedColumns: ["equipe_id"]
          },
          {
            foreignKeyName: "lancamentos_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "relatorio_por_data"
            referencedColumns: ["equipe_id"]
          },
          {
            foreignKeyName: "lancamentos_tipo_servico_id_fkey"
            columns: ["tipo_servico_id"]
            isOneToOne: false
            referencedRelation: "tipos_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      medicoes: {
        Row: {
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: string
          numero_medicao: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          numero_medicao: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          numero_medicao?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      medicoes_salvas: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          filtros_aplicados: Json
          id: string
          nome: string
          total_clientes: number
          total_lancamentos: number
          total_valor: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          filtros_aplicados?: Json
          id?: string
          nome: string
          total_clientes?: number
          total_lancamentos?: number
          total_valor?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          filtros_aplicados?: Json
          id?: string
          nome?: string
          total_clientes?: number
          total_lancamentos?: number
          total_valor?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      precos_tipos_empresa: {
        Row: {
          atualizado_por: string | null
          created_at: string
          empresa_id: string
          id: string
          tipo_servico_id: string
          updated_at: string
          valor_unitario_decimal: number
          vigente_ate: string | null
          vigente_desde: string
        }
        Insert: {
          atualizado_por?: string | null
          created_at?: string
          empresa_id: string
          id?: string
          tipo_servico_id: string
          updated_at?: string
          valor_unitario_decimal: number
          vigente_ate?: string | null
          vigente_desde?: string
        }
        Update: {
          atualizado_por?: string | null
          created_at?: string
          empresa_id?: string
          id?: string
          tipo_servico_id?: string
          updated_at?: string
          valor_unitario_decimal?: number
          vigente_ate?: string | null
          vigente_desde?: string
        }
        Relationships: [
          {
            foreignKeyName: "precos_tipos_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "demonstrativo_financeiro"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "precos_tipos_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precos_tipos_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "relatorio_medicao_por_data"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "precos_tipos_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "relatorio_por_data"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "precos_tipos_empresa_tipo_servico_id_fkey"
            columns: ["tipo_servico_id"]
            isOneToOne: false
            referencedRelation: "tipos_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_servico: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          descricao: string | null
          exige_horas: boolean
          exige_kwp: boolean
          exige_quantidade_paineis: boolean
          id: string
          modelo_cobranca: string
          nome: string
          permite_aditivo: boolean
          permite_desconto: boolean
          updated_at: string
          valor_unitario_decimal: number | null
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          descricao?: string | null
          exige_horas?: boolean
          exige_kwp?: boolean
          exige_quantidade_paineis?: boolean
          id?: string
          modelo_cobranca: string
          nome: string
          permite_aditivo?: boolean
          permite_desconto?: boolean
          updated_at?: string
          valor_unitario_decimal?: number | null
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          descricao?: string | null
          exige_horas?: boolean
          exige_kwp?: boolean
          exige_quantidade_paineis?: boolean
          id?: string
          modelo_cobranca?: string
          nome?: string
          permite_aditivo?: boolean
          permite_desconto?: boolean
          updated_at?: string
          valor_unitario_decimal?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      demonstrativo_financeiro: {
        Row: {
          data_fim_periodo: string | null
          data_inicio_periodo: string | null
          empresa_id: string | null
          nome_empresa: string | null
          responsavel: string | null
          tipo_remuneracao: string | null
          total_aditivos: number | null
          total_clientes: number | null
          total_descontos: number | null
          total_lancamentos: number | null
          total_paineis: number | null
          valor_kwp: number | null
          valor_total_calculado: number | null
          valor_total_geral: number | null
          valor_total_padrao_entrada: number | null
          valor_total_paineis: number | null
        }
        Relationships: []
      }
      relatorio_medicao_por_data: {
        Row: {
          data_fim: string | null
          data_inicio: string | null
          empresa_id: string | null
          equipe_id: string | null
          medicao_id: string | null
          nome_empresa: string | null
          nome_equipe: string | null
          numero_medicao: string | null
          responsavel: string | null
          status: string | null
          tipo_remuneracao: string | null
          total_aditivos: number | null
          total_clientes: number | null
          total_descontos: number | null
          total_lancamentos: number | null
          total_paineis: number | null
          valor_kwp: number | null
          valor_total_calculado: number | null
          valor_total_geral: number | null
          valor_total_padrao_entrada: number | null
          valor_total_paineis: number | null
        }
        Relationships: []
      }
      relatorio_por_data: {
        Row: {
          cliente: string | null
          created_at: string | null
          data_contrato: string | null
          descricao_material: string | null
          empresa_id: string | null
          equipe_id: string | null
          lancamento_id: string | null
          motivo_desconto: string | null
          motivo_obra: string | null
          motivo_visita: string | null
          nome_empresa: string | null
          nome_equipe: string | null
          numero_paineis: number | null
          potencia_painel: number | null
          potencia_total_kwp: number | null
          responsavel: string | null
          tipo_aditivo: string | null
          tipo_padrao: string | null
          tipo_remuneracao: string | null
          tipo_servico: string | null
          updated_at: string | null
          valor_calculado: number | null
          valor_kwp: number | null
          valor_servico: number | null
        }
        Relationships: []
      }
      v_medicoes_salvas: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          filtros_aplicados: Json | null
          id: string | null
          nome: string | null
          total_clientes: number | null
          total_lancamentos: number | null
          total_valor: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          filtros_aplicados?: Json | null
          id?: string | null
          nome?: string | null
          total_clientes?: number | null
          total_lancamentos?: number | null
          total_valor?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          filtros_aplicados?: Json | null
          id?: string | null
          nome?: string | null
          total_clientes?: number | null
          total_lancamentos?: number | null
          total_valor?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      clientes_insert: {
        Args: { p_nome: string }
        Returns: {
          ativo: boolean
          created_at: string
          data_contrato: string | null
          documento: string | null
          email: string | null
          empresa_id: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }[]
      }
      deletar_equipe_segura: {
        Args: { equipe_id_param: string }
        Returns: boolean
      }
      exec_sql: {
        Args: { sql: string }
        Returns: undefined
      }
      gerar_relatorio_periodo: {
        Args: {
          p_data_fim: string
          p_data_inicio: string
          p_empresa_id?: string
        }
        Returns: {
          cliente: string
          data_contrato: string
          empresa_id: string
          equipe_id: string
          lancamento_id: string
          nome_empresa: string
          nome_equipe: string
          numero_paineis: number
          potencia_painel: number
          potencia_total_kwp: number
          responsavel: string
          tipo_remuneracao: string
          tipo_servico: string
          total_periodo: number
          valor_calculado: number
          valor_kwp: number
          valor_servico: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      list_medicoes_salvas: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          data_fim: string
          data_inicio: string
          filtros_aplicados: Json
          id: string
          nome: string
          total_clientes: number
          total_lancamentos: number
          total_valor: number
          updated_at: string
        }[]
      }
      salvar_medicao_por_data: {
        Args: {
          p_data_fim: string
          p_data_inicio: string
          p_empresa_id?: string
          p_numero_medicao?: string
        }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
