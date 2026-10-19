import React from "react";
import Link from "next/link";
import { NAVIGATION_CATEGORIES, STORE_NAME, STORE_POLICIES } from "@/lib/constants";
import { ShieldCheck, Truck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-brand-border bg-brand-navy text-white">
      {/* Confidence & Store Policies Banner */}
      <div className="border-b border-white/10 px-4 py-7">
        <div className="mx-auto grid max-w-store grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d79b73]" />
            <div>
              <h4 className="text-sm font-bold text-white">Warranty information</h4>
              <p className="mt-1 text-sm leading-6 text-white/60">{STORE_POLICIES.warranty}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d79b73]" />
            <div>
              <h4 className="text-sm font-bold text-white">Shipping information</h4>
              <p className="mt-1 text-sm leading-6 text-white/60">{STORE_POLICIES.shipping}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-store px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent font-bold text-white">
                <span>A</span>
              </div>
              <span className="text-sm font-extrabold tracking-tight uppercase text-white">
                {STORE_NAME}
              </span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/60">
              Find automotive replacement parts with clear product details, part numbers, and availability.
            </p>
          </div>

          {/* Parts Categories */}
          <div>
            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
              Catalog Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-white/65">
              {NAVIGATION_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div>
            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
              Store Service
            </h4>
            <ul className="space-y-2.5 text-sm text-white/65">
              <li>
                <Link href="/products" className="transition-colors hover:text-white">
                  Browse All Parts
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition-colors hover:text-white">
                  View Shopping Cart
                </Link>
              </li>
              <li>
                <span className="block text-white/60">{STORE_POLICIES.returns}</span>
              </li>
            </ul>
          </div>

          {/* Administration & System */}
          <div>
            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
              Authorized Staff
            </h4>
            <ul className="space-y-2.5 text-sm text-white/65">
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
                >
                  <span>Admin Management Console</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row">
          <div>
            &copy; {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
          </div>
          <div>Product details and availability shown where provided.</div>
        </div>
      </div>
    </footer>
  );
};
