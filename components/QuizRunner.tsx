"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CheckpointQuiz } from "@/lib/types";
import { useSubmitCheckpoint } from "@/lib/queries";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import { cn } from "@/lib/utils";

export function QuizRunner({
  courseId,
  checkpointDay,
  quiz,
  onRetake,
}: {
  courseId: string;
  checkpointDay: number;
  quiz: CheckpointQuiz;
  onRetake: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsed, setElapsed] = useState(0);
  const [questionElapsed, setQuestionElapsed] = useState(0);

  const startRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const tabSwitchCount = useRef(0);
  const warnedRef = useRef(false);

  const submit = useSubmitCheckpoint(courseId, checkpointDay);
  const [result, setResult] = useState<{ score: number; passed: boolean; feedback: string } | null>(null);

  // Overall + per-question timers
  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      setQuestionElapsed(Math.floor((Date.now() - questionStartRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    questionStartRef.current = Date.now();
    setQuestionElapsed(0);
  }, [index]);

  // Tab-switch detection
  useEffect(() => {
    function flagSwitch() {
      tabSwitchCount.current += 1;
      if (!warnedRef.current) {
        warnedRef.current = true;
        toast.warning("Leaving this tab is being noted.");
      }
    }
    function onVisibility() {
      if (document.hidden) flagSwitch();
    }
    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", flagSwitch);
    return () => {
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", flagSwitch);
    };
  }, []);

  // Block copy / paste / right-click for the duration of the quiz
  useEffect(() => {
    function block(e: Event) {
      e.preventDefault();
    }
    document.addEventListener("copy", block);
    document.addEventListener("paste", block);
    document.addEventListener("cut", block);
    document.addEventListener("contextmenu", block);
    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block);
    };
  }, []);

  if (result) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center pt-24 text-center">
        <div
          className={cn(
            "mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2",
            result.passed ? "border-moss text-moss" : "border-rust text-rust"
          )}
        >
          <span className="font-display text-2xl font-semibold">{Math.round(result.score)}</span>
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          {result.passed ? "Checkpoint cleared" : "Not this time"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{result.feedback}</p>
        {!result.passed && (
          <Button className="mt-8" onClick={onRetake}>
            Retake checkpoint
          </Button>
        )}
      </div>
    );
  }

  const question = quiz.questions[index];
  const total = quiz.questions.length;
  const isLast = index === total - 1;
  const selected = answers[question.id];

  function selectOption(opt: string) {
    setAnswers((a) => ({ ...a, [question.id]: opt }));
  }

  function handleNext() {
    if (isLast) {
      handleSubmit();
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handleSubmit() {
    submit.mutate(
      {
        answers,
        tab_switch_count: tabSwitchCount.current,
        time_taken_seconds: Math.floor((Date.now() - startRef.current) / 1000),
      },
      {
        onSuccess: (data) => setResult(data),
        onError: () => toast.error("Couldn't submit the checkpoint — try again."),
      }
    );
  }

  return (
    <div className="mx-auto max-w-2xl select-none pt-10">
      <div className="mb-8 flex items-center justify-between font-mono text-xs text-muted">
        <span>
          Question <span className="text-ink">{index + 1}</span> / {total}
        </span>
        <span className="font-tabular">
          Q · {formatTime(questionElapsed)} &nbsp;·&nbsp; Total · {formatTime(elapsed)}
        </span>
      </div>

      <div className="mb-8 h-1 w-full rounded-full bg-border/60">
        <div
          className="h-1 rounded-full bg-brass transition-[width] duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <h2 className="mb-8 font-display text-xl font-semibold leading-snug text-ink">{question.prompt}</h2>

      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => selectOption(opt)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-colors",
              selected === opt
                ? "border-brass bg-brass/[0.08] text-ink"
                : "border-border bg-surface text-ink/90 hover:border-brass/40"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                selected === opt ? "border-brass bg-brass text-[#14171C]" : "border-border text-muted"
              )}
            >
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <Button onClick={handleNext} disabled={!selected || submit.isPending}>
          {submit.isPending ? <Spinner className="text-[#14171C]" /> : isLast ? "Submit checkpoint" : "Next"}
        </Button>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
