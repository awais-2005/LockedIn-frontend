"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { useCourses } from "@/lib/queries";

export default function DashboardPage() {
  const { data: courses, isLoading } = useCourses();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brass-strong">Your roadmaps</p>
            <h1 className="font-display text-3xl font-semibold text-ink">Courses</h1>
          </div>
          <Link
            href="/dashboard/courses/new"
            className="flex items-center gap-2 rounded-md bg-brass px-4 py-2.5 text-sm font-medium text-[#14171C] transition-colors hover:bg-brass-strong"
          >
            <PlusIcon className="h-4 w-4" />
            Add new course
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[168px] animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        )}

        {!isLoading && courses && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
            <p className="font-display text-xl font-semibold text-ink">No courses yet</p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Upload a course document and RoadmapAI will lay out the days for you.
            </p>
            <Link
              href="/dashboard/courses/new"
              className="mt-6 rounded-md bg-brass px-4 py-2.5 text-sm font-medium text-[#14171C] hover:bg-brass-strong"
            >
              Add your first course
            </Link>
          </div>
        )}

        {!isLoading && courses && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
