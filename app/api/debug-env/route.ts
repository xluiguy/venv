import { NextResponse } from 'next/server'

export async function GET() {
  const data = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NAO DEFINIDO',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'NAO DEFINIDO',
    SUPABASE_SERVICE_ROLE_SET: process.env.SUPABASE_SERVICE_ROLE ? 'Sim, esta definida' : 'NAO DEFINIDO',
  }

  return NextResponse.json(data)
}


