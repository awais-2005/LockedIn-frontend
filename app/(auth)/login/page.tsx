"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { authApi, ApiError } from "@/lib/api";
import { useGoogleIdentity } from "@/lib/useGoogleIdentity";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type Values = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    try {
      await authApi.login(values);
      router.push(params.get("next") ?? "/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Wrong email or password.");
      } else {
        toast.error("Couldn't sign you in — try again.");
      }
    }
  }

  const { buttonRef, ready } = useGoogleIdentity({
    onToken: async (id_token) => {
      try {
        await authApi.google({ id_token });
        router.push(params.get("next") ?? "/dashboard");
      } catch {
        toast.error("Google sign-in failed — try again.");
      }
    },
  });

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Pick up your roadmap where you left off."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-brass-strong hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Spinner className="text-[#14171C]" /> : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div ref={buttonRef} className="flex justify-center" />
      {!ready && (
        <Button variant="secondary" className="w-full" disabled>
          Sign in with Google
        </Button>
      )}
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
