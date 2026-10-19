import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

/**
 * Creates a Supabase client for Server Components, Route Handlers, and Server Actions.
 * Handles reading and writing authentication session cookies.
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  const supabaseUrl = getSupabaseUrl() || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = getSupabaseAnonKey() || "placeholder-anon-key";

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
