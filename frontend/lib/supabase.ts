import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vwgosyydmlmzkljjsnbr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Z29zeXlkbWxtemtsampzbmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMDYzMjIsImV4cCI6MjA0ODg4MjMyMn0.HBP-50K7IAKySK5sgipTBPmYmHiysXbPFHU1mtGs5Ms'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) 