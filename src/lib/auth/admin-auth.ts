import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AdminUser, Json } from "@/types/database";

export interface AdminSession {
  userId: string;
  email: string;
  role: "admin" | "super_admin" | "editor";
  isDemo?: boolean;
}

const DEV_ADMIN_COOKIE = "aerox_admin_dev_session";

/**
 * Retrieves the current admin session server-side.
 * Returns the session details if authenticated and authorized, or null.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();

  // 1. Production / Configured Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabaseServerClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return null;
      }

      // Verify user ID in the restricted admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id, role, created_at")
        .eq("id", user.id)
        .single();

      if (adminError || !adminUser) {
        // User is authenticated, but not an administrator
        return null;
      }

      return {
        userId: user.id,
        email: user.email || "admin@aerox.local",
        role: adminUser.role,
        isDemo: false,
      };
    } catch {
      return null;
    }
  }

  // 2. Development Demo Session (Active only when Supabase is not yet configured)
  const devSession = cookieStore.get(DEV_ADMIN_COOKIE);
  if (devSession?.value) {
    try {
      const parsed = JSON.parse(devSession.value);
      if (parsed && parsed.email) {
        return {
          userId: parsed.userId || "dev-admin-uid",
          email: parsed.email,
          role: parsed.role || "super_admin",
          isDemo: true,
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Server-side route guard for administrative pages.
 * Redirects unauthorized requests to `/admin/login`.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

/**
 * Server-side audit logging function for administrative mutations.
 */
export async function logAdminAction({
  action,
  entityType,
  entityId,
  details,
}: {
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  const session = await getAdminSession();
  if (!session) return;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabaseServerClient();
      await supabase.from("audit_logs").insert({
        user_id: session.userId,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: (details as unknown as Json) || null,
      });
    } catch (err) {
      console.error("Failed to write audit log:", err);
    }
  }
}
