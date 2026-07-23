"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAnalyzeCourse, useConfirmCourse } from "@/lib/queries";
import type { AnalyzeDraft } from "@/lib/types";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Spinner } from "./ui/Spinner";
import { cn } from "@/lib/utils";

const confirmSchema = z.object({
  chosen_days: z.coerce.number().int().min(1, "At least 1 day").max(1000, "1000 days max"),
});
type ConfirmValues = z.infer<typeof confirmSchema>;

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

export function NewCourseWizard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<AnalyzeDraft | null>(null);

  const analyze = useAnalyzeCourse();
  const confirm = useConfirmCourse();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    values: draft ? { chosen_days: draft.recommended_days } : undefined,
  });

  const onDrop = useCallback(
    (accepted: File[], rejected: { file: File }[]) => {
      if (rejected.length > 0) {
        toast.error("Only PDF and DOCX files are supported.");
        return;
      }
      const picked = accepted[0];
      if (!picked) return;
      setFile(picked);
      analyze.mutate(picked, {
        onSuccess: (data) => setDraft(data),
        onError: () => toast.error("Couldn't read that document — try another file."),
      });
    },
    [analyze]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    disabled: analyze.isPending || !!draft,
  });

  function onConfirm(values: ConfirmValues) {
    if (!draft) return;
    confirm.mutate(
      { draft_id: draft.draft_id, chosen_days: values.chosen_days },
      {
        onSuccess: (data) => {
          toast.success("Course is on the board.");
          router.push(`/dashboard/courses/${data.course.id}`);
        },
        onError: () => toast.error("Couldn't create the course — try again."),
      }
    );
  }

  function reset() {
    setFile(null);
    setDraft(null);
  }

  // Step 2: draft ready, confirm the day count
  if (draft) {
    return (
      <div className="animate-fade-up rounded-2xl border border-border bg-surface p-8">
        <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brass-strong">Step 2 of 2</p>
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink">Set the pace</h2>

        <div className="mb-6 rounded-xl border border-border bg-bg p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Extracted from your document</p>
          <p className="mt-1 font-display text-lg font-semibold text-ink">{draft.extracted_title}</p>
          <p className="mt-2 text-sm text-muted">
            About <span className="font-tabular text-ink">{draft.topic_count_estimate}</span> distinct topics detected.
            {draft.detected_explicit_days
              ? ` The document itself suggests ${draft.detected_explicit_days} days.`
              : ""}
          </p>
        </div>

        <form onSubmit={handleSubmit(onConfirm)}>
          <div className="mb-6 rounded-xl border border-brass/40 bg-brass/[0.06] p-5">
            <p className="text-sm text-ink">
              We recommend{" "}
              <span className="font-display text-lg font-semibold text-brass-strong">
                {draft.recommended_days} days
              </span>{" "}
              based on this document.
            </p>
            <div className="mt-4 max-w-[10rem]">
              <Field label="Days to spread this over" htmlFor="chosen_days" error={errors.chosen_days?.message}>
                <Input
                  id="chosen_days"
                  type="number"
                  min={1}
                  max={1000}
                  className="font-tabular"
                  {...register("chosen_days")}
                />
              </Field>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={reset} disabled={confirm.isPending}>
              Back
            </Button>
            <Button type="submit" disabled={confirm.isPending} className="flex-1">
              {confirm.isPending ? <Spinner className="text-[#14171C]" /> : "Build my roadmap"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Step 1: upload
  return (
    <div className="animate-fade-up rounded-2xl border border-border bg-surface p-8">
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brass-strong">Step 1 of 2</p>
      <h2 className="mb-6 font-display text-2xl font-semibold text-ink">Drop in your course</h2>

      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          isDragActive ? "border-brass bg-brass/[0.06]" : "border-border hover:border-brass/50",
          analyze.isPending && "pointer-events-none opacity-70"
        )}
      >
        <input {...getInputProps()} />
        {analyze.isPending ? (
          <>
            <Spinner className="mb-4 h-6 w-6 text-brass" />
            <p className="text-sm text-muted">Reading {file?.name}…</p>
          </>
        ) : (
          <>
            <UploadIcon className="mb-4 h-8 w-8 text-muted" />
            <p className="text-sm font-medium text-ink">
              {isDragActive ? "Drop it here" : "Drag a PDF or DOCX here, or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted">One file · PDF or DOCX only</p>
          </>
        )}
      </div>
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 15V4m0 0L7 9m5-5 5 5M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
