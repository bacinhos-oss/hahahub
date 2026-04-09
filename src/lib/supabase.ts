import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jnilgukmyfukazwduuig.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaWxndWtteWZ1a2F6d2R1dWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMDMwMDMsImV4cCI6MjA1OTY3OTAwM30.KVevVRilONcVvint3l_'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
