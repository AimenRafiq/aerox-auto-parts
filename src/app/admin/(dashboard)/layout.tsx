import React from "react";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/admin-auth";
import { Badge } from "@/components/ui/badge";
import { AdminNavTabs } from "@/components/admin/admin-nav-tabs";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { STORE_NAME } from "@/lib/constants";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-brand-bg pb-12">
      {/* Top Admin Control Bar */}
      <header className="border-b border-brand-border bg-brand-navy px-4 py-3 text-white shadow-sm">
        <div className="mx-auto flex max-w-store items-center justify-between gap-4">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 group text-decoration-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-accent font-bold text-white shadow-sm">
                <span>A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight text-white leading-none">
                  {STORE_NAME} Control
                </span>
                <span className="text-[10px] text-white/70 mt-0.5">
                  Administrative Management Plane
                </span>
              </div>
            </Link>
            <div className="hidden sm:block">
              <Badge variant="accent">
                {session.role.replace(/_/g, " ").toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* User Session & Actions */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:flex flex-col text-right">
              <span className="font-semibold text-white truncate max-w-[180px]">
                {session.email}
              </span>
              <span className="text-[10px] text-white/60">
                {session.isDemo ? "Local Dev Session" : "Verified Supabase Auth"}
              </span>
            </div>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 rounded border border-white/20 bg-white/5 px-2.5 py-1 text-white hover:bg-white/15 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Storefront</span>
            </Link>

            <AdminSignOutButton />
          </div>
        </div>
      </header>

      {/* Navigation Sub-Strip */}
      <div className="border-b border-brand-border bg-white px-4 py-2 shadow-xs">
        <div className="mx-auto max-w-store">
          <AdminNavTabs />
        </div>
      </div>

      {/* Dashboard Content */}
      <main className="mx-auto max-w-store px-4 pt-6">{children}</main>
    </div>
  );
}

