"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Lock, ShieldAlert, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { loginAdminAction } from "@/actions/admin-auth-actions";
import { STORE_NAME } from "@/lib/constants";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      const res = await loginAdminAction(formData);
      if (res && !res.success && res.error) {
        setError(res.error);
      }
    });
  };

  const handleFillDemo = () => {
    setEmail("admin@aerox.local");
    setPassword("aerox2026");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-navy text-white shadow-md">
            <Lock className="h-6 w-6 text-brand-accent-light" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-brand-navy">
            {STORE_NAME} Control Plane
          </h1>
          <p className="text-xs text-brand-muted">
            Restricted staff authentication for catalog and order management.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded border border-brand-border bg-white p-6 shadow-sm space-y-4">
          {error && (
            <Alert variant="error" title="Authentication Error">
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Staff Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aerox.local"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isPending}
              isLoading={isPending}
              leftIcon={<KeyRound className="h-4 w-4" />}
            >
              {isPending ? "Verifying Credentials..." : "Authenticate Administrator"}
            </Button>
          </form>

          {/* Dev Demo Shortcut */}
          <div className="border-t border-brand-border/70 pt-4">
            <div className="flex items-center justify-between text-xs text-brand-muted">
              <span>Local Dev Quick-Fill:</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="font-semibold text-brand-accent hover:underline"
              >
                Use admin@aerox.local
              </button>
            </div>
          </div>
        </div>

        {/* Security & Access Policy Notice */}
        <div className="rounded border border-brand-border bg-white/60 p-4 text-[11px] text-brand-muted space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-brand-navy">
            <ShieldAlert className="h-4 w-4 text-brand-accent" />
            <span>Strict Role-Based Security Notice</span>
          </div>
          <p className="leading-relaxed">
            Public self-registration cannot create administrator accounts. In production, administrative permissions must be explicitly granted in the <code>admin_users</code> table by a Super Administrator.
          </p>
        </div>

        {/* Return to Storefront */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-ink transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

