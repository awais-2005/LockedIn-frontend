"use client";

import Link from "next/link";
import type { CourseSummary } from "@/lib/types";
import { Badge } from "./ui/Badge";
import { useDeleteCourse } from "@/lib/queries";
import { toast } from "sonner";

export function CourseCard({ course }: { course: CourseSummary }) {
  const del = useDeleteCourse();
  const percent = course.total_days > 0 ? Math.round((course.completed_days / course.total_days) * 100) : 0;

  function handleDelete() {
    if (!confirm(`Remove "${course.title}"? This can't be undone.`)) return;
    del.mutate(course.id, {
      onSuccess: () => toast.success("Course removed"),
      onError: () => toast.error("Couldn't remove that course — try again."),
    });
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brass/50">
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <Badge tone={percent === 100 ? "moss" : "brass"}>
            {percent === 100 ? "Complete" : `Day ${course.completed_days + 1} of ${course.total_days}`}
          </Badge>
          <button
            type="button"
            onClick={handleDelete}
            className="opacity-0 transition-opacity group-hover:opacity-100 text-muted hover:text-rust"
            aria-label={`Remove ${course.title}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink line-clamp-2">
          {course.title}
        </h3>
      </div>

      <div className="mt-5">
        <div className="mb-3 h-1.5 w-full rounded-full bg-border/60">
          <div
            className="h-1.5 rounded-full bg-brass transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <Link
          href={`/dashboard/courses/${course.id}`}
          className="flex w-full items-center justify-center rounded-md border border-border py-2.5 text-sm font-medium text-ink transition-colors hover:border-brass/60 hover:text-brass-strong"
        >
          {course.completed_days === 0 ? "Start course" : "Continue"}
        </Link>
      </div>
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
