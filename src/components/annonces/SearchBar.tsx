"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) params.set("q", val);
      else params.delete("q");
      params.delete("page");
      router.push(`/?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Chercher un sport, une ville…"
        className="w-full font-dm text-sm text-text-primary bg-background border border-[#c8d9eb] rounded-pill pl-9 pr-4 py-2.5 placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-colors"
      />
    </div>
  );
}
