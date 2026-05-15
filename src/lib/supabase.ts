import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jnilgukmyfukazwduuig.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxndWtteWZ1a2F6d2R1dWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTQ2MDksImV4cCI6MjA5MTE5MDYwOX0.KbwZf30tJMdEb_3Zie3UoGA-zJO4Z7zIf9sKYOggSyU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },

})