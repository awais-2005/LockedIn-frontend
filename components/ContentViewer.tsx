"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function ContentViewer({
  technical,
  simple,
}: {
  technical: string;
  simple: string;
}) {
  const [mode, setMode] = useState<"technical" | "simple">("technical");

  return (
    <div>
      <div className="mb-6 inline-flex items-center rounded-full border border-border bg-surface p-0.5">
        {(["technical", "simple"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors",
              mode === m ? "bg-brass text-[#14171C]" : "text-muted hover:text-ink"
            )}
          >
            {m === "technical" ? "Technical" : "Simple"}
          </button>
        ))}
      </div>

      <article
        className={cn(
          "prose prose-sm max-w-none",
          "prose-headings:font-display prose-headings:font-semibold prose-headings:text-ink",
          "prose-p:text-ink/90 prose-p:leading-relaxed",
          "prose-strong:text-ink prose-code:text-brass-strong prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:bg-bg prose-pre:border prose-pre:border-border prose-pre:rounded-lg",
          "prose-a:text-brass-strong prose-blockquote:border-brass/50 prose-blockquote:text-muted",
          "prose-li:text-ink/90 prose-hr:border-border"
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{mode === "technical" ? technical : simple}</ReactMarkdown>
      </article>
    </div>
  );
}
