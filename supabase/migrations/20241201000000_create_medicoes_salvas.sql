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

-- Habilitar RLS
ALTER TABLE medicoes_salvas ENABLE ROW LEVEL SECURITY;

-- Criar políticas para anon
CREATE POLICY "Allow all for anon" ON medicoes_salvas FOR ALL USING (true);

-- Criar políticas para usuários autenticados
CREATE POLICY "Allow all for authenticated" ON medicoes_salvas FOR ALL USING (true);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_medicoes_salvas_created_at ON medicoes_salvas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medicoes_salvas_nome ON medicoes_salvas(nome);

-- Comentários para documentação
COMMENT ON TABLE medicoes_salvas IS 'Tabela para armazenar medições salvas dos relatórios consolidados';
COMMENT ON COLUMN medicoes_salvas.nome IS 'Nome da medição';
COMMENT ON COLUMN medicoes_salvas.data_inicio IS 'Data de início do período da medição';
COMMENT ON COLUMN medicoes_salvas.data_fim IS 'Data de fim do período da medição';
COMMENT ON COLUMN medicoes_salvas.total_lancamentos IS 'Total de lançamentos na medição';
COMMENT ON COLUMN medicoes_salvas.total_clientes IS 'Total de clientes na medição';
COMMENT ON COLUMN medicoes_salvas.total_valor IS 'Valor total da medição';
COMMENT ON COLUMN medicoes_salvas.filtros_aplicados IS 'Filtros aplicados na medição (JSON)';
