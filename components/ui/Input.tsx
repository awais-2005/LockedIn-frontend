"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-brass-strong/50",
        error ? "border-rust" : "border-border",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
