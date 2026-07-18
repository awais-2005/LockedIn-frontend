"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QuizRunner } from "@/components/QuizRunner";
import { Spinner } from "@/components/ui/Spinner";
import { useCheckpoint, useCourse } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";

export default function CheckpointPage() {
  const { courseId, checkpointDay } = useParams<{ courseId: string; checkpointDay: string }>();
  const day = Number(checkpointDay);
  const router = useRouter();
  const qc = useQueryClient();

  const { data: course } = useCourse(courseId);
  const { data: quiz, isLoading } = useCheckpoint(courseId, day);
  const [attempt, setAttempt] = useState(0);

  function handleRetake() {
    qc.invalidateQueries({ queryKey: ["courses", courseId, "checkpoint", day] });
    setAttempt((a) => a + 1);
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <FlagIcon className="h-4 w-4 text-brass" />
            <span className="font-mono text-xs uppercase tracking-wide text-muted">
              Checkpoint · {course?.title ?? "Roadmap"} · Day {day}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => router.push(`/dashboard/courses/${courseId}`)}
              className="text-xs text-muted hover:text-ink"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 pb-24">
        {isLoading && (
          <div className="flex justify-center pt-32">
            <Spinner className="h-6 w-6 text-brass" />
          </div>
        )}
        {quiz && (
          <QuizRunner key={attempt} courseId={courseId} checkpointDay={day} quiz={quiz} onRetake={handleRetake} />
        )}
      </main>
    </div>
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
