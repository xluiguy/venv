# Instruções para Criar a Tabela de Medições

## Problema
A tabela `medicoes_salvas` não existe no banco de dados, causando erro na página de medições.

## Solução

### 1. Acesse o Painel do Supabase
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto: `rhfsbtyylxzznwtnyuow`

### 2. Abra o SQL Editor
- No menu lateral, clique em "SQL Editor"
- Clique em "New query" para criar uma nova query

### 3. Execute o SQL
Cole o seguinte código SQL e execute:

```sql
-- Criar tabela medicoes_salvas
CREATE TABLE IF NOT EXISTS medicoes_salvas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  data_inicio DATE,
  data_fim DATE,
  total_lancamentos INTEGER DEFAULT 0,
  total_clientes INTEGER DEFAULT 0,
  total_valor DECIMAL(10,2) DEFAULT 0,
  filtros_aplicados JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar comentários para documentação
COMMENT ON TABLE medicoes_salvas IS 'Tabela para armazenar medições salvas dos relatórios';
COMMENT ON COLUMN medicoes_salvas.nome IS 'Nome da medição';
COMMENT ON COLUMN medicoes_salvas.data_inicio IS 'Data de início do período da medição';
COMMENT ON COLUMN medicoes_salvas.data_fim IS 'Data de fim do período da medição';
COMMENT ON COLUMN medicoes_salvas.total_lancamentos IS 'Total de lançamentos no período';
COMMENT ON COLUMN medicoes_salvas.total_clientes IS 'Total de clientes únicos no período';
COMMENT ON COLUMN medicoes_salvas.total_valor IS 'Valor total dos lançamentos no período';
COMMENT ON COLUMN medicoes_salvas.filtros_aplicados IS 'Filtros aplicados na medição (JSON)';

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_medicoes_salvas_updated_at') THEN
        CREATE TRIGGER update_medicoes_salvas_updated_at 
            BEFORE UPDATE ON medicoes_salvas 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
```

### 4. Verifique a Criação
- Após executar o SQL, vá para "Table Editor" no menu lateral
- Verifique se a tabela `medicoes_salvas` aparece na lista

### 5. Teste no App
- Volte para o app em `http://localhost:3000/medicoes`
- A página deve carregar sem erros
- O botão "Criar Tabela" não deve mais aparecer

## Estrutura da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único (chave primária) |
| nome | VARCHAR(255) | Nome da medição |
| data_inicio | DATE | Data de início do período |
| data_fim | DATE | Data de fim do período |
| total_lancamentos | INTEGER | Total de lançamentos no período |
| total_clientes | INTEGER | Total de clientes únicos |
| total_valor | DECIMAL(10,2) | Valor total dos lançamentos |
| filtros_aplicados | JSONB | Filtros aplicados (equipes, cliente) |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

## Funcionalidades
- ✅ Salvar medições dos relatórios
- ✅ Exportar medições em CSV
- ✅ Excluir medições
- ✅ Visualizar histórico de medições
- ✅ Filtros por equipe e cliente
- ✅ Cálculo automático de totais
