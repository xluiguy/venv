import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase'
import { config } from './config'

// Cliente Supabase para uso server-side (com service role)
export function createSupabaseServerClient() {
  return createClient<Database>(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Cliente Supabase para uso server-side (com anon key - para operações públicas)
export function createSupabaseAnonClient() {
  return createClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Cliente Supabase para uso em middleware e edge functions
export function createSupabaseEdgeClient() {
  return createClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
