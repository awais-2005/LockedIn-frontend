"use client";

import { useProgress } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function ProgressBar({ courseId }: { courseId: string }) {
  const { data, isLoading } = useProgress(courseId);

  if (isLoading || !data) {
    return <div className="h-14 w-full animate-pulse rounded-lg bg-surface" />;
  }

  const { percent, completed_days, total_days, checkpoints } = data;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between font-mono text-xs text-muted">
        <span>
          <span className="font-tabular text-ink">{completed_days}</span> / {total_days} days cleared
        </span>
        <span className="font-tabular">{Math.round(percent)}%</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-border/60">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-brass to-brass-strong transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
        {checkpoints.map((cp) => {
          const left = total_days > 0 ? (cp.day / total_days) * 100 : 0;
          const passed = cp.status === "passed";
          const failed = cp.status === "failed";
          return (
            <div
              key={cp.day}
              title={`${cp.type === "master" ? "Master" : "Big"} checkpoint · day ${cp.day} · ${cp.status}`}
              className="absolute -top-1.5 flex flex-col items-center"
              style={{ left: `calc(${left}% - 5px)` }}
            >
              <span
                className={cn(
                  "block h-5 w-[3px] rounded-full border border-bg",
                  passed && "bg-moss",
                  failed && "bg-rust",
                  !passed && !failed && "bg-muted/60"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
