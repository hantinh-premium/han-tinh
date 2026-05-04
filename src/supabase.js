import { createClient } from '@supabase/supabase-js'
 
export const supabase = createClient(
  'https://jpmguuajsuwrqoimjiot.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbWd1dWFqc3V3cnFvaW1qaW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MDYzNDUsImV4cCI6MjA5MzM4MjM0NX0.lz45eUzwpVQvrDVdJSAxvCwWlwCZn7H0nRVAL9Oqkjk'
)
 
