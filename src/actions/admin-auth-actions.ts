"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminLoginResult {
  success: boolean;
  error?: string;
}

const DEV_ADMIN_COOKIE = "aerox_admin_dev_session";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder-project") &&
      !key.includes("placeholder-anon-key")
  );
}

export async function loginAdminAction(
  formData: FormData
): Promise<AdminLoginResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      error: "Please enter both an email address and password.",
    };
  }

  // 1. Production / Configured Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return {
          success: false,
          error: error?.message || "Invalid administrator credentials.",
        };
      }

      // Check whether user exists in the admin_users table
      const { data: adminUser, error: roleError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (roleError || !adminUser) {
        // Immediately revoke session: normal customers cannot access admin
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Access Denied: Your account does not have administrative privileges.",
        };
      }

      redirect("/admin");
    } catch (err: unknown) {
      if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      return {
        success: false,
        error: "Authentication service encountered an unexpected error.",
      };
    }
  }

  // 2. Development Mode (Active when remote Supabase project is not yet linked)
  if (email === "admin@aerox.local" && password === "aerox2026") {
    const cookieStore = await cookies();
    cookieStore.set(
      DEV_ADMIN_COOKIE,
      JSON.stringify({
        userId: "dev-super-admin-01",
        email: "admin@aerox.local",
        role: "super_admin",
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      }
    );

    redirect("/admin");
  }

  return {
    success: false,
    error: "Invalid admin credentials. (In local dev mode, use admin@aerox.local / aerox2026)",
  };
}

export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await getSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // Ignored during sign-out
    }
  }

  cookieStore.delete(DEV_ADMIN_COOKIE);
  redirect("/admin/login");
}

