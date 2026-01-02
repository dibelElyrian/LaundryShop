import { createClient } from '@supabase/supabase-js'

// Access environment variables using bracket notation to avoid false positives in secret scanners
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL']
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY']

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
