"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const AdminNavTabs: React.FC = () => {
  const pathname = usePathname();

  const links = [
    {
      href: "/admin",
      label: "Overview",
      icon: <LayoutDashboard className="h-4 w-4" />,
      exact: true,
    },
    {
      href: "/admin/products",
      label: "Products",
      icon: <Package className="h-4 w-4" />,
      exact: false,
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: <Layers className="h-4 w-4" />,
      exact: false,
    },
    {
      href: "/admin/brands",
      label: "Brands",
      icon: <Tag className="h-4 w-4" />,
      exact: false,
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: <ShoppingBag className="h-4 w-4" />,
      exact: false,
    },
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded px-3 py-2 transition-colors whitespace-nowrap",
              isActive
                ? "bg-brand-navy text-white font-semibold shadow-sm"
                : "text-brand-muted hover:bg-brand-border/40 hover:text-brand-ink"
            )}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

