import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "brass" | "moss" | "rust";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-border/40 text-muted",
    brass: "bg-brass/15 text-brass-strong",
    moss: "bg-moss/15 text-moss",
    rust: "bg-rust/15 text-rust",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
