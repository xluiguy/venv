import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

export async function POST() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'clientes') THEN
            CREATE TABLE public.clientes (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              nome TEXT NOT NULL,
              endereco TEXT,
              data_contrato DATE,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
          END IF;
        END $$;
        
        ALTER TABLE public.clientes
          ADD COLUMN IF NOT EXISTS endereco TEXT,
          ADD COLUMN IF NOT EXISTS data_contrato DATE,
          DROP COLUMN IF EXISTS documento,
          DROP COLUMN IF EXISTS email,
          DROP COLUMN IF EXISTS telefone;

        ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
        
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='clientes select anon') THEN
            CREATE POLICY "clientes select anon" ON public.clientes FOR SELECT TO anon USING (true);
          END IF;
        END $$;
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='clientes insert anon') THEN
            CREATE POLICY "clientes insert anon" ON public.clientes FOR INSERT TO anon WITH CHECK (true);
          END IF;
        END $$;
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='clientes update anon') THEN
            CREATE POLICY "clientes update anon" ON public.clientes FOR UPDATE TO anon USING (true) WITH CHECK (true);
          END IF;
        END $$;
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes' AND policyname='clientes delete anon') THEN
            CREATE POLICY "clientes delete anon" ON public.clientes FOR DELETE TO anon USING (true);
          END IF;
        END $$;

        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'clientes_insert') THEN
            CREATE OR REPLACE FUNCTION public.clientes_insert(p_nome text, p_endereco text, p_data_contrato date)
            RETURNS uuid
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $function$
            DECLARE
              new_id uuid;
            BEGIN
              INSERT INTO public.clientes (nome, endereco, data_contrato)
              VALUES (p_nome, p_endereco, p_data_contrato)
              RETURNING id INTO new_id;
              RETURN new_id;
            END;
            $function$;
          END IF;
        END;
        $$;
      `
    })

    if (error) {
      // Log detalhado do erro
      logger.error({
        message: 'Erro ao executar SQL para verificar/criar tabela clientes via RPC',
        errorDetails: error,
      });

      // Erro 42P07: Tabela já existe (não é um erro crítico aqui)
      if (error.code === '42P07') { 
        logger.warn('Tabela "clientes" já existe, pulando criação.');
        return NextResponse.json({ success: true, message: 'Tabela "clientes" já existia e foi verificada.' });
      }

      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Tabela "clientes" verificada/criada com sucesso.' })
  } catch (err: unknown) {
    logger.error({
        message: 'Erro inesperado na rota /api/clientes/verificar',
        errorDetails: err,
    });
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}


