"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Challenge, ChallengeSubmitResult } from "@/lib/types";
import { useSubmitChallenge } from "@/lib/queries";
import { CodeEditor } from "./CodeEditor";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import { Badge } from "./ui/Badge";
import { cn } from "@/lib/utils";

export function ChallengePanel({
  courseId,
  dayNumber,
  challenges,
  onResultsChange,
}: {
  courseId: string;
  dayNumber: number;
  challenges: Challenge[];
  onResultsChange?: (results: Record<string, ChallengeSubmitResult>) => void;
}) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, ChallengeSubmitResult>>(() =>
    Object.fromEntries(
      challenges
        .filter((c) => c.is_solved)
        .map((c) => [c.id, { is_correct: true, feedback: "Already solved — nice work." }])
    )
  );

  // Surface already-solved challenges to the parent immediately, so
  // "Mark day complete" doesn't require re-submitting solved work.
  useEffect(() => {
    if (Object.keys(results).length > 0) onResultsChange?.(results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (challenges.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
        No challenges attached to this day yet.
      </div>
    );
  }

  const active = challenges[index];
  const isCoding = active.type === "coding_medium" || active.type === "coding_expert";

  function recordResult(challengeId: string, result: ChallengeSubmitResult) {
    setResults((prev) => {
      const next = { ...prev, [challengeId]: result };
      onResultsChange?.(next);
      return next;
    });
  }

  return (
    <div>
      {challenges.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {challenges.map((c, i) => {
            const r = results[c.id];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  i === index ? "border-brass text-brass-strong" : "border-border text-muted hover:text-ink"
                )}
              >
                Challenge {i + 1}
                {r && (
                  <span className={cn("h-1.5 w-1.5 rounded-full", r.is_correct ? "bg-moss" : "bg-rust")} />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-3 flex items-center gap-2">
        <Badge tone="brass">{active.difficulty}</Badge>
        <Badge>{active.type.replace("_", " ")}</Badge>
      </div>

      {isCoding ? (
        <CodeEditor
          key={active.id}
          courseId={courseId}
          dayNumber={dayNumber}
          challenge={active}
          onResult={(r) => recordResult(active.id, r)}
        />
      ) : (
        <TheoryChallenge
          key={active.id}
          courseId={courseId}
          dayNumber={dayNumber}
          challenge={active}
          onResult={(r) => recordResult(active.id, r)}
        />
      )}
    </div>
  );
}

function TheoryChallenge({
  courseId,
  dayNumber,
  challenge,
  onResult,
}: {
  courseId: string;
  dayNumber: number;
  challenge: Challenge;
  onResult: (result: ChallengeSubmitResult) => void;
}) {
  const [answer, setAnswer] = useState(challenge.submitted_answer ?? "");
  const [result, setResult] = useState<ChallengeSubmitResult | null>(
    challenge.is_solved ? { is_correct: true, feedback: "Already solved — nice work." } : null
  );
  const submit = useSubmitChallenge(courseId, dayNumber);

  function handleSubmit() {
    if (challenge.is_solved || !answer.trim() || submit.isPending) return;
    submit.mutate(
      { challengeId: challenge.id, content: answer },
      {
        onSuccess: (data) => {
          setResult(data);
          onResult(data);
        },
        onError: () => toast.error("Couldn't submit right now — try again."),
      }
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="mb-4 text-sm text-ink/90">{challenge.prompt}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={6}
        readOnly={challenge.is_solved}
        placeholder="Write your answer…"
        className="w-full resize-y rounded-lg border border-border bg-bg px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brass-strong/50 disabled:opacity-70"
      />
      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmit} disabled={challenge.is_solved || !answer.trim() || submit.isPending}>
          {submit.isPending ? <Spinner className="text-[#14171C]" /> : challenge.is_solved ? "Solved" : "Submit"}
        </Button>
      </div>

      {result && (
        <div
          className={cn(
            "mt-4 rounded-lg border p-4 text-sm",
            result.is_correct ? "border-moss/50 bg-moss/[0.08] text-ink" : "border-rust/50 bg-rust/[0.08] text-ink"
          )}
        >
          <p className="mb-1 font-medium">{result.is_correct ? "Correct" : "Not quite"}</p>
          <p className="text-ink/80">{result.feedback}</p>
        </div>
      )}
    </div>
  );
}
