"use client";

import Link from "next/link";
import type { ProgressCheckpoint } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CheckpointFlag({ courseId, checkpoint }: { courseId: string; checkpoint: ProgressCheckpoint }) {
  const { day, type, status } = checkpoint;
  const locked = status === "locked";
  const passed = status === "passed";
  const failed = status === "failed";

  const label = type === "master" ? "Master checkpoint" : "Checkpoint";

  const content = (
    <div
      className={cn(
        "col-span-full flex items-center gap-4 rounded-xl border px-5 py-3.5",
        locked && "border-dashed border-border/80 bg-transparent opacity-60",
        !locked && !passed && !failed && "border-brass/50 bg-brass/[0.06]",
        passed && "border-moss/50 bg-moss/[0.06]",
        failed && "border-rust/50 bg-rust/[0.06]"
      )}
    >
      <FlagIcon
        className={cn(
          "h-5 w-5 shrink-0",
          locked && "text-muted",
          !locked && !passed && !failed && "text-brass-strong",
          passed && "text-moss",
          failed && "text-rust"
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs uppercase tracking-wide text-muted">
          {label} · day {day}
        </p>
        <p className="truncate text-sm font-medium text-ink">
          {type === "master"
            ? "A wider review across the last 30 days"
            : "A quick check on the last 10 days"}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide",
          locked && "bg-border/50 text-muted",
          !locked && !passed && !failed && "bg-brass/20 text-brass-strong",
          passed && "bg-moss/20 text-moss",
          failed && "bg-rust/20 text-rust"
        )}
      >
        {locked ? "Locked" : passed ? "Passed" : failed ? "Retake" : "Ready"}
      </span>
    </div>
  );

  if (locked) {
    return (
      <div title="Unlocks once you reach this day" className="col-span-full cursor-not-allowed">
        {content}
      </div>
    );
  }

  return (
    <Link href={`/dashboard/courses/${courseId}/checkpoint/${day}`} className="col-span-full block">
      {content}
    </Link>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M6 4c3-1.5 4.5 1.5 7.5 0S18 4 18 4v8c-3 1.5-4.5-1.5-7.5 0S6 12 6 12V4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
