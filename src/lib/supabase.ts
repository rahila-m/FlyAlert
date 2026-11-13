import { createClient } from '@supabase/supabase-js'

// The single Supabase client used by the whole frontend.
// It uses the PUBLIC publishable (anon) key. What a user may read or write is
// enforced in the database by Row Level Security, not by hiding this key.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase is not configured. Copy .env.example to .env.local, add your project URL ' +
      'and publishable key, then restart the dev server.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
