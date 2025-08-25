import { createClient } from '@supabase/supabase-js'
import { config } from './config'

export type FontePreco = 'manual' | 'equipe' | 'servico' | 'global'

export interface ResolucaoPreco {
  valorUnitario: number
  fonte: FontePreco
}

export async function resolverPrecoPainel(
  options: {
    overrideManual?: number | null
    equipeId?: string | null
    empresaId?: string | null
    tipoServicoId?: string | null
  }
): Promise<ResolucaoPreco> {
  const supabase = createClient(config.supabase.url, config.supabase.anonKey)

  // 1) Override manual
  if (typeof options.overrideManual === 'number' && !Number.isNaN(options.overrideManual)) {
    return { valorUnitario: options.overrideManual, fonte: 'manual' }
  }

  // 2) Preço da equipe (removido da regra de negócio)

  // 3) Preço configurado por empresa + tipo (vigente) - PRIORIDADE MÁXIMA para instalação por painel
  if (options.tipoServicoId) {
    // Determina empresa: direto via options ou via equipe
    let empresaId: string | null = options.empresaId ?? null
    if (!empresaId && options.equipeId) {
      const { data: equipeEmpresa } = await supabase
        .from('equipes')
        .select('empresa_id')
        .eq('id', options.equipeId)
        .limit(1)
      empresaId = equipeEmpresa?.[0]?.empresa_id ?? null
    }
    if (empresaId) {
      const { data: pte } = await supabase
        .from('precos_tipos_empresa')
        .select('valor_unitario_decimal, vigente_desde')
        .eq('empresa_id', empresaId)
        .eq('tipo_servico_id', options.tipoServicoId)
        .is('vigente_ate', null)
        .order('vigente_desde', { ascending: false })
        .limit(1)
      const v = pte?.[0]?.valor_unitario_decimal
      if (typeof v === 'number' && !Number.isNaN(v)) {
        return { valorUnitario: v, fonte: 'servico' }
      }
    }
  }

  // 4) Valor por painel da empresa (FALLBACK - só se não houver preço específico)
  if (options.empresaId) {
    try {
      const { data: emp } = await supabase
        .from('empresas')
        .select('tipo_remuneracao, valor_painel')
        .eq('id', options.empresaId)
        .limit(1)
      const empresa = emp?.[0]
      if (empresa && (empresa.tipo_remuneracao === 'painel' || empresa.tipo_remuneracao === 'por_painel')) {
        const valor = empresa.valor_painel
        if (typeof valor === 'number' && !Number.isNaN(valor)) {
          return { valorUnitario: valor, fonte: 'servico' }
        }
      }
    } catch (error) {
      console.log('Erro ao buscar valor_painel da empresa:', error)
    }
  }

  // 5) Preço configurado no tipo de serviço (se aplicável)
  if (options.tipoServicoId) {
    const { data: ts } = await supabase
      .from('tipos_servico')
      .select('valor_unitario_decimal, modelo_cobranca, ativo')
      .eq('id', options.tipoServicoId)
      .limit(1)
    const tipo = ts?.[0]
    if (tipo?.ativo && tipo?.modelo_cobranca === 'painel') {
      const valor = tipo?.valor_unitario_decimal
      if (typeof valor === 'number' && !Number.isNaN(valor)) {
        return { valorUnitario: valor, fonte: 'servico' }
      }
    }
  }

  // 6) Global
  const { data } = await supabase
    .from('configuracoes_precos')
    .select('*')
    .eq('chave', 'valor_painel_default')
    .order('vigente_desde', { ascending: false })
    .limit(1)

  const global = data?.[0]?.valor_decimal ?? 90
  return { valorUnitario: Number(global), fonte: 'global' }
}


export async function resolverPrecoKwp(
  options: {
    overrideManual?: number | null
    equipeId?: string | null
    empresaId?: string | null
    tipoServicoId?: string | null
  }
): Promise<ResolucaoPreco> {
  const supabase = createClient(config.supabase.url, config.supabase.anonKey)

  // 1) Override manual
  if (typeof options.overrideManual === 'number' && !Number.isNaN(options.overrideManual)) {
    return { valorUnitario: options.overrideManual, fonte: 'manual' }
  }

  // 2) Preço da equipe (removido da regra de negócio)

  // 3) Preço configurado por empresa + tipo (vigente)
  if (options.tipoServicoId) {
    let empresaId: string | null = options.empresaId ?? null
    if (!empresaId && options.equipeId) {
      const { data: equipeEmpresa } = await supabase
        .from('equipes')
        .select('empresa_id')
        .eq('id', options.equipeId)
        .limit(1)
      empresaId = (equipeEmpresa?.[0] as any)?.empresa_id ?? null
    }
    if (empresaId) {
      const { data: pte } = await supabase
        .from('precos_tipos_empresa')
        .select('valor_unitario_decimal, vigente_desde')
        .eq('empresa_id', empresaId)
        .eq('tipo_servico_id', options.tipoServicoId)
        .is('vigente_ate', null)
        .order('vigente_desde', { ascending: false })
        .limit(1)
      const v = pte?.[0]?.valor_unitario_decimal as unknown as number | undefined
      if (typeof v === 'number' && !Number.isNaN(v)) {
        return { valorUnitario: v, fonte: 'servico' }
      }
    }
  }

  // 4) Valor por kWp da empresa
  if (options.empresaId) {
    const { data: emp } = await supabase
      .from('empresas')
      .select('valor_kwp')
      .eq('id', options.empresaId)
      .limit(1)
    const v = (emp?.[0] as any)?.valor_kwp as number | undefined
    if (typeof v === 'number' && !Number.isNaN(v)) {
      return { valorUnitario: v, fonte: 'servico' }
    }
  }

  // 5) Preço no tipo de serviço
  if (options.tipoServicoId) {
    const { data: ts } = await supabase
      .from('tipos_servico')
      .select('valor_unitario_decimal, modelo_cobranca, ativo')
      .eq('id', options.tipoServicoId)
      .limit(1)
    const tipo = ts?.[0] as any
    if (tipo?.ativo && tipo?.modelo_cobranca === 'kwp') {
      const valor = tipo?.valor_unitario_decimal as number | undefined
      if (typeof valor === 'number' && !Number.isNaN(valor)) {
        return { valorUnitario: valor, fonte: 'servico' }
      }
    }
    
    // Fallback para tipos mock (instalacao_kwp)
    if (options.tipoServicoId === 'instalacao_kwp') {
      return { valorUnitario: 320, fonte: 'servico' }
    }
  }

  // 6) Global/default (se houver)
  const { data } = await supabase
    .from('configuracoes_precos')
    .select('*')
    .eq('chave', 'valor_kwp_default')
    .order('vigente_desde', { ascending: false })
    .limit(1)

  const global = (data?.[0] as any)?.valor_decimal ?? 0
  return { valorUnitario: Number(global), fonte: 'global' }
}

