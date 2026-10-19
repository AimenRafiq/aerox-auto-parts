"use client";

import React, { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAdminAction } from "@/actions/admin-auth-actions";

export const AdminSignOutButton: React.FC = () => {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await logoutAdminAction();
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      aria-label="Sign out of admin session"
      className="inline-flex items-center gap-1.5 rounded border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-50 transition-colors"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{isPending ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
};

