"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useLogout, useMe } from "@/lib/queries";

export interface Crumb {
  label: string;
  href?: string;
}

export function Navbar({ crumbs = [] }: { crumbs?: Crumb[] }) {
  const { data } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout.mutateAsync();
    router.push("/login");
  }

  const initial = data?.user?.full_name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <TrailMark className="h-5 w-5 text-brass" />
            <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
              RoadmapAI
            </span>
          </Link>
          {crumbs.length > 0 && (
            <nav className="flex min-w-0 items-center gap-2 pl-2 font-mono text-xs text-muted">
              {crumbs.map((c, i) => (
                <span key={i} className="flex min-w-0 items-center gap-2">
                  <span aria-hidden className="text-border">
                    ···
                  </span>
                  {c.href ? (
                    <Link href={c.href} className="truncate hover:text-brass-strong">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="truncate text-ink">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface font-mono text-xs font-medium text-ink hover:border-brass/60"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {initial}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-raised shadow-lg animate-fade-up">
                  <div className="border-b border-border px-3.5 py-2.5">
                    <p className="truncate text-sm font-medium text-ink">{data?.user?.full_name}</p>
                    <p className="truncate text-xs text-muted">{data?.user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-rust hover:bg-rust/10"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function TrailMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 19c3-1 3-6 6-6s3 5 6 5 3-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="3" cy="19" r="1.6" fill="currentColor" />
      <circle cx="21" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}
