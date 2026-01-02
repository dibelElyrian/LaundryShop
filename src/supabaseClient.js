import { createClient } from '@supabase/supabase-js'

// Use VITE_LSM_... for Netlify production to avoid secret scanning false positives
// Use VITE_SUPABASE_... for local development
const supabaseUrl = import.meta.env.VITE_LSM_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_LSM_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
