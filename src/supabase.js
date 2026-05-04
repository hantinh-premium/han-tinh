import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(url && key)

if (!hasSupabase) {
  console.warn('Thiếu VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY. Thêm trong Vercel → Settings → Environment Variables, rồi Redeploy.')
}

export const supabase = hasSupabase ? createClient(url, key) : null
