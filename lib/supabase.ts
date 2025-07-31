import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we're in demo mode (no Supabase configured)
export const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project")

let supabaseClient: any = null

if (!isDemoMode) {
  try {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)
  } catch (error) {
    console.warn("Failed to initialize Supabase client:", error)
  }
}

export const supabase = isDemoMode ? null : supabaseClient
