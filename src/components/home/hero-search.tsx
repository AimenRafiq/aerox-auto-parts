"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/products`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mt-8 flex max-w-2xl flex-col gap-2 rounded-xl bg-white p-2 shadow-2xl shadow-black/20 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">
          <Search className="h-[18px] w-[18px]" />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by part name, number, or system"
          className="w-full rounded-lg border-0 bg-white py-3.5 pl-11 pr-4 text-sm text-brand-ink placeholder:text-brand-muted/75 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        variant="primary"
        className="sm:shrink-0 sm:px-6"
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        Search Parts
      </Button>
    </form>
  );
};
