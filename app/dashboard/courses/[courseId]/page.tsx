"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { DayGrid } from "@/components/DayGrid";
import { ProgressBar } from "@/components/ProgressBar";
import { useCourse, useProgress } from "@/lib/queries";

export default function CourseBoardPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading } = useCourse(courseId);
  const { data: progress } = useProgress(courseId);

  return (
    <div className="min-h-screen">
      <Navbar crumbs={course ? [{ label: course.title }] : []} />
      <main className="mx-auto max-w-[1440px] px-6 py-10">
        {isLoading && (
          <div className="space-y-6">
            <div className="h-8 w-64 animate-pulse rounded bg-surface" />
            <div className="h-14 w-full animate-pulse rounded-lg bg-surface" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[132px] animate-pulse rounded-xl bg-surface" />
              ))}
            </div>
          </div>
        )}

        {course && (
          <>
            <div className="mb-6">
              <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brass-strong">Roadmap</p>
              <h1 className="font-display text-3xl font-semibold text-ink">{course.title}</h1>
            </div>

            <div className="mb-10 max-w-xl">
              <ProgressBar courseId={courseId} />
            </div>

            <DayGrid courseId={courseId} days={course.days} checkpoints={progress?.checkpoints ?? []} />
          </>
        )}
      </main>
    </div>
  );
}
