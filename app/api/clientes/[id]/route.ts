import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

async function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
            .from('clientes')
            .select('id, nome, endereco, data_contrato')
            .eq('id', params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ success: false, error: 'Cliente não encontrado' }, { status: 404 });
            }
            logger.error({ message: `Erro ao buscar cliente ${params.id}`, errorDetails: error });
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
        logger.error({ message: `Erro inesperado ao buscar cliente ${params.id}`, errorDetails: err });
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { nome, endereco, data_contrato } = await request.json();

        if (!nome) {
            return NextResponse.json({ success: false, error: 'O nome é obrigatório.' }, { status: 400 });
        }

        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
            .from('clientes')
            .update({
                nome,
                endereco,
                data_contrato,
                updated_at: new Date().toISOString()
            })
            .eq('id', params.id)
            .select('id, nome, endereco, data_contrato')
            .single();

        if (error) {
            logger.error({ message: `Erro ao atualizar cliente ${params.id}`, errorDetails: error });
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
        logger.error({ message: `Erro inesperado ao atualizar cliente ${params.id}`, errorDetails: err });
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await getSupabaseClient();
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', params.id);

        if (error) {
            logger.error({ message: `Erro ao deletar cliente ${params.id}`, errorDetails: error });
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Cliente deletado com sucesso' });
    } catch (err: unknown) {
        logger.error({ message: `Erro inesperado ao deletar cliente ${params.id}`, errorDetails: err });
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}


