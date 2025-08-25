import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        supabase: {
          url: config.supabase.url,
          hasAnonKey: !!config.supabase.anonKey,
          hasServiceRoleKey: !!config.supabase.serviceRoleKey,
        },
        admin: {
          emails: config.admin.emails,
          defaultEmail: config.admin.defaultEmail,
        },
        environment: config.app.environment,
        isDevelopment: config.app.isDevelopment,
        isProduction: config.app.isProduction,
      }
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}


