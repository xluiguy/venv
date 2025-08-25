import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE

    if (!supabaseUrl || !supabaseServiceRole) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas'
      }, { status: 500 })
    }

    // Usar fetch direto para evitar problemas de import
    const headers = {
      'Authorization': `Bearer ${supabaseServiceRole}`,
      'Content-Type': 'application/json',
      'apikey': supabaseServiceRole
    }

    console.log('🔍 Verificando estrutura detalhadamente...')

    const results = []

    // 1. Verificar tabela profiles
    try {
      const profilesResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
        method: 'GET',
        headers
      })
      
      if (profilesResponse.status === 200) {
        results.push({ check: 'profiles_table', status: '✅', message: 'Tabela profiles existe' })
      } else if (profilesResponse.status === 404) {
        results.push({ check: 'profiles_table', status: '❌', message: 'Tabela profiles não encontrada' })
      } else {
        results.push({ check: 'profiles_table', status: '⚠️', message: `Status: ${profilesResponse.status}` })
      }
    } catch (err) {
      results.push({ check: 'profiles_table', status: '❌', message: 'Erro ao verificar tabela' })
    }

    // 2. Verificar função handle_new_user
    try {
      const funcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/handle_new_user`, {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      })
      
      // Se a função existe, vai dar erro de parâmetros (esperado)
      // Se não existe, vai dar 404
      if (funcResponse.status === 404) {
        results.push({ check: 'handle_function', status: '❌', message: 'Função handle_new_user não existe' })
      } else {
        results.push({ check: 'handle_function', status: '✅', message: 'Função handle_new_user existe' })
      }
    } catch (err) {
      results.push({ check: 'handle_function', status: '⚠️', message: 'Erro na verificação da função' })
    }

    // 3. Verificar triggers
    try {
      const triggerResponse = await fetch(`${supabaseUrl}/rest/v1/information_schema.triggers?select=trigger_name&trigger_name=eq.on_auth_user_created`, {
        method: 'GET',
        headers
      })
      
      if (triggerResponse.status === 200) {
        const triggers = await triggerResponse.json()
        if (triggers && triggers.length > 0) {
          results.push({ check: 'auth_trigger', status: '✅', message: 'Trigger on_auth_user_created existe' })
        } else {
          results.push({ check: 'auth_trigger', status: '❌', message: 'Trigger on_auth_user_created não encontrado' })
        }
      } else {
        results.push({ check: 'auth_trigger', status: '⚠️', message: `Erro ao verificar triggers: ${triggerResponse.status}` })
      }
    } catch (err) {
      results.push({ check: 'auth_trigger', status: '❌', message: 'Erro na verificação do trigger' })
    }

    // 4. Verificar RLS
    try {
      const rlsResponse = await fetch(`${supabaseUrl}/rest/v1/pg_tables?select=rowsecurity&tablename=eq.profiles&schemaname=eq.public`, {
        method: 'GET',
        headers
      })
      
      if (rlsResponse.status === 200) {
        const rlsData = await rlsResponse.json()
        if (rlsData && rlsData.length > 0) {
          const rlsEnabled = rlsData[0].rowsecurity
          results.push({ 
            check: 'rls_enabled', 
            status: rlsEnabled ? '✅' : '⚠️', 
            message: `RLS ${rlsEnabled ? 'habilitado' : 'desabilitado'}` 
          })
        } else {
          results.push({ check: 'rls_enabled', status: '❌', message: 'Não foi possível verificar RLS' })
        }
      } else {
        results.push({ check: 'rls_enabled', status: '⚠️', message: `Erro ao verificar RLS: ${rlsResponse.status}` })
      }
    } catch (err) {
      results.push({ check: 'rls_enabled', status: '❌', message: 'Erro na verificação do RLS' })
    }

    // 5. Verificar políticas
    try {
      const policiesResponse = await fetch(`${supabaseUrl}/rest/v1/pg_policies?select=policyname&tablename=eq.profiles`, {
        method: 'GET',
        headers
      })
      
      if (policiesResponse.status === 200) {
        const policies = await policiesResponse.json()
        results.push({ 
          check: 'rls_policies', 
          status: policies && policies.length > 0 ? '✅' : '❌', 
          message: `${policies?.length || 0} políticas RLS encontradas` 
        })
      } else {
        results.push({ check: 'rls_policies', status: '⚠️', message: `Erro ao verificar políticas: ${policiesResponse.status}` })
      }
    } catch (err) {
      results.push({ check: 'rls_policies', status: '❌', message: 'Erro na verificação das políticas' })
    }

    // Análise dos resultados
    const issues = results.filter(r => r.status === '❌')
    const warnings = results.filter(r => r.status === '⚠️')
    
    let diagnosis = []
    let recommendations = []

    if (issues.length > 0) {
      diagnosis.push(`❌ ${issues.length} problema(s) crítico(s) encontrado(s)`)
      recommendations.push('Execute o SQL de correção novamente')
      recommendations.push('Verifique se não houve erros no SQL Editor do Supabase')
    }

    if (warnings.length > 0) {
      diagnosis.push(`⚠️ ${warnings.length} aviso(s) encontrado(s)`)
    }

    if (issues.length === 0 && warnings.length === 0) {
      diagnosis.push('✅ Estrutura parece estar correta')
      recommendations.push('O problema pode estar nas configurações de autenticação do Supabase')
      recommendations.push('Verifique se o projeto Supabase está ativo e configurado corretamente')
    }

    return NextResponse.json({
      success: issues.length === 0,
      message: issues.length === 0 ? 
        'Verificação concluída - estrutura OK' : 
        `${issues.length} problema(s) encontrado(s)`,
      results: results,
      diagnosis: diagnosis,
      recommendations: recommendations,
      summary: {
        total_checks: results.length,
        passed: results.filter(r => r.status === '✅').length,
        failed: issues.length,
        warnings: warnings.length
      }
    })

  } catch (error) {
    console.error('💥 Erro na verificação estrutural:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro inesperado na verificação',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
