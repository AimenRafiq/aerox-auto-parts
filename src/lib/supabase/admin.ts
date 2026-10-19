import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseUrl } from "./config";

/**
 * Creates a privileged Supabase client using the SERVICE ROLE key.
 * 
 * SECURITY WARNING:
 * - This client bypasses Row Level Security (RLS).
 * - It must NEVER be used on the client-side or exported to client bundles.
 * - Only use in trusted server-side mutations, webhooks, or bootstrap routines.
 */
export function getSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "FATAL SECURITY VIOLATION: getSupabaseAdminClient called in browser environment."
    );
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin credentials: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
