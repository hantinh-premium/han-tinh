import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasSupabase) {
  console.warn('Missing Supabase env variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Project Settings → Environment Variables, then redeploy.')
}

export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
