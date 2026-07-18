"use client";

import Link from "next/link";
import type { CourseDaySummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DayCard({ courseId, day }: { courseId: string; day: CourseDaySummary }) {
  const { day_number, topic_title, status } = day;

  if (status === "locked") {
    return (
      <div
        title="Complete the previous day to unlock"
        className="group relative flex h-[132px] cursor-not-allowed flex-col justify-between rounded-xl border border-dashed border-border/80 bg-surface/40 p-4 opacity-60"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted">DAY {day_number}</span>
          <LockIcon className="h-4 w-4 text-muted" />
        </div>
        <p className="line-clamp-2 text-sm text-muted">{topic_title}</p>
        <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded border border-border bg-raised px-2 py-0.5 text-[11px] text-muted opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          Complete the previous day to unlock
        </span>
      </div>
    );
  }

  const isToday = status === "unlocked";

  return (
    <Link
      href={`/dashboard/courses/${courseId}/day/${day_number}`}
      className={cn(
        "relative flex h-[132px] flex-col justify-between rounded-xl border p-4 transition-all",
        isToday
          ? "border-brass bg-brass/[0.07] shadow-[0_0_0_1px_rgb(var(--brass)/0.35)] hover:shadow-[0_0_0_1px_rgb(var(--brass)/0.6)]"
          : "border-moss/40 bg-moss/[0.06] hover:border-moss/70"
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("font-mono text-xs", isToday ? "text-brass-strong" : "text-moss")}>
          DAY {day_number}
        </span>
        {isToday ? (
          <span className="flex h-5 items-center rounded-full bg-brass px-2 text-[10px] font-semibold uppercase tracking-wide text-[#14171C] animate-pulse-ring">
            Today
          </span>
        ) : (
          <CheckIcon className="h-4 w-4 text-moss" />
        )}
      </div>
      <p className="line-clamp-2 text-sm font-medium text-ink">{topic_title}</p>
    </Link>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8.5 12.5 2.3 2.3 4.7-4.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
