import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function POST() {
  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey)

    const email = config.admin.defaultEmail
    const password = config.admin.defaultPassword

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}

