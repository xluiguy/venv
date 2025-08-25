import { createBrowserClient } from '@supabase/ssr'
import { type Database } from './supabase'
import { config } from './config'

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient<Database>(config.supabase.url, config.supabase.anonKey)
  return supabaseClient
}
