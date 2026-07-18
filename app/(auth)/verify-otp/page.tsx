"use client";

import { useEffect, useRef, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { authApi, ApiError } from "@/lib/api";

const schema = z.object({
  otp: z.string().length(6, "Enter all 6 digits").regex(/^\d+$/, "Digits only"),
});
type Values = z.infer<typeof schema>;

const RESEND_COOLDOWN = 60;

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { otp: "" } });

  const otp = watch("otp");
  const digits = otp.padEnd(6, " ").split("");

  useEffect(() => {
    const id = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  function updateDigit(index: number, char: string) {
    const clean = char.replace(/\D/g, "").slice(-1);
    const chars = otp.padEnd(6, " ").split("");
    chars[index] = clean || " ";
    const next = chars.join("").replace(/\s+$/, "");
    setValue("otp", next.replace(/\s/g, ""));
    if (clean && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function onSubmit(values: Values) {
    try {
      await authApi.verifyOtp({ email, otp: values.otp });
      toast.success("Verified. Welcome to RoadmapAI.");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        toast.error("That code isn't right — check and try again.");
      } else {
        toast.error("Couldn't verify that code — try again.");
      }
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await authApi.resendOtp({ email });
      toast.success("New code sent.");
      setCooldown(RESEND_COOLDOWN);
    } catch {
      toast.error("Couldn't resend the code — try again shortly.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="One more step"
      title="Verify your email"
      subtitle={email ? `Enter the 6-digit code sent to ${email}.` : "Enter the 6-digit code we sent you."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Verification code" htmlFor="otp-0" error={errors.otp?.message}>
          <div className="flex justify-between gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                inputMode="numeric"
                maxLength={1}
                value={digits[i]?.trim() ?? ""}
                onChange={(e) => updateDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-11 rounded-md border border-border bg-surface text-center font-mono text-lg text-ink focus:outline-none focus:ring-2 focus:ring-brass-strong/50"
              />
            ))}
          </div>
        </Field>
        <Button type="submit" disabled={isSubmitting || otp.length !== 6} className="mt-2">
          {isSubmitting ? <Spinner className="text-[#14171C]" /> : "Verify"}
        </Button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || resending}
        className="mt-6 w-full text-center text-sm text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Sending…" : "Resend code"}
      </button>
    </AuthShell>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
