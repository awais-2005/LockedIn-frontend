"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { ContentViewer } from "@/components/ContentViewer";
import { ChatPanel } from "@/components/ChatPanel";
import { ChallengePanel } from "@/components/ChallengePanel";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { useCourse, useDay, useCompleteDay } from "@/lib/queries";
import { ApiError } from "@/lib/api";
import type { ChallengeSubmitResult, CompleteDayBlocked } from "@/lib/types";

type Tab = "learn" | "ask" | "challenge";

export default function DayDetailPage() {
  const { courseId, dayNumber } = useParams<{ courseId: string; dayNumber: string }>();
  const dayNum = Number(dayNumber);
  const router = useRouter();

  const { data: course } = useCourse(courseId);
  const { data: day, isLoading } = useDay(courseId, dayNum);
  const completeDay = useCompleteDay(courseId, dayNum);

  const [tab, setTab] = useState<Tab>("learn");
  const [results, setResults] = useState<Record<string, ChallengeSubmitResult>>({});

  const allChallengesPassed = useMemo(() => {
    if (!day || day.challenges.length === 0) return true;
    return day.challenges.every((c) => results[c.id]?.is_correct);
  }, [day, results]);

  const alreadyCompleted = day?.status === "completed";

  async function handleComplete() {
    try {
      await completeDay.mutateAsync();
      toast.success("Day complete. Tomorrow's waypoint is unlocked.");
      router.push(`/dashboard/courses/${courseId}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        const body = err.body as CompleteDayBlocked;
        if (body?.checkpoint_day) {
          toast.error(`${body.reason} Clear the day ${body.checkpoint_day} checkpoint first.`);
        } else {
          toast.error(body?.reason ?? "This day isn't ready to complete yet.");
        }
      } else {
        toast.error("Couldn't complete this day — try again.");
      }
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar
        crumbs={
          course
            ? [
                { label: course.title, href: `/dashboard/courses/${courseId}` },
                { label: day ? `Day ${day.day_number}` : `Day ${dayNumber}` },
              ]
            : []
        }
      />
      <main className="mx-auto max-w-4xl px-6 py-10">
        {isLoading && (
          <div className="space-y-6">
            <div className="h-8 w-72 animate-pulse rounded bg-surface" />
            <div className="h-64 w-full animate-pulse rounded-xl bg-surface" />
          </div>
        )}

        {day && (
          <>
            <div className="mb-6 max-w-md">
              <ProgressBar courseId={courseId} />
            </div>

            <div className="mb-2 flex items-center gap-2">
              <Badge tone="brass">Day {day.day_number}</Badge>
              <Badge>{day.topic_type}</Badge>
              {alreadyCompleted && <Badge tone="moss">Completed</Badge>}
            </div>
            <h1 className="mb-6 font-display text-3xl font-semibold text-ink">{day.topic_title}</h1>

            <div className="mb-6 flex gap-1 border-b border-border">
              {(
                [
                  ["learn", "Learn"],
                  ["ask", "Ask AI"],
                  ["challenge", "Challenge"],
                ] as [Tab, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={cn(
                    "relative px-4 py-2.5 text-sm font-medium transition-colors",
                    tab === value ? "text-ink" : "text-muted hover:text-ink"
                  )}
                >
                  {label}
                  {tab === value && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brass" />
                  )}
                </button>
              ))}
            </div>

            {/* Each tab is fully unmounted when inactive — the Challenge tab in
               particular must not leave lesson content mounted (even hidden)
               so answers can't be referenced while a challenge is active. */}
            {tab === "learn" && (
              <ContentViewer technical={day.content_technical} simple={day.content_simple} />
            )}
            {tab === "ask" && <ChatPanel courseId={courseId} dayNumber={dayNum} topicTitle={day.topic_title} />}
            {tab === "challenge" && (
              <ChallengePanel
                courseId={courseId}
                dayNumber={dayNum}
                challenges={day.challenges}
                onResultsChange={setResults}
              />
            )}

            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <p className="text-xs text-muted">
                {alreadyCompleted
                  ? "You've already cleared this day — feel free to review it."
                  : allChallengesPassed
                    ? "All set — mark this day complete to unlock the next one."
                    : "Pass every challenge above to unlock Mark Day Complete."}
              </p>
              <Button
                onClick={handleComplete}
                disabled={alreadyCompleted || !allChallengesPassed || completeDay.isPending}
              >
                {completeDay.isPending ? (
                  <Spinner className="text-[#14171C]" />
                ) : alreadyCompleted ? (
                  "Day completed"
                ) : (
                  "Mark day complete"
                )}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
