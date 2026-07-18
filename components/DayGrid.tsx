"use client";

import { useLayoutEffect, useRef, useState, useCallback } from "react";
import type { CourseDaySummary, ProgressCheckpoint } from "@/lib/types";
import { DayCard } from "./DayCard";
import { CheckpointFlag } from "./CheckpointFlag";

interface Segment {
  d: string;
  active: boolean;
}

export function DayGrid({
  courseId,
  days,
  checkpoints = [],
}: {
  courseId: string;
  days: CourseDaySummary[];
  checkpoints?: ProgressCheckpoint[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<number, HTMLElement>());
  const [segments, setSegments] = useState<Segment[]>([]);
  const [viewBox, setViewBox] = useState("0 0 100 100");

  const setNodeRef = useCallback(
    (dayNumber: number) => (el: HTMLElement | null) => {
      if (el) nodeRefs.current.set(dayNumber, el);
      else nodeRefs.current.delete(dayNumber);
    },
    []
  );

  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerBox = container.getBoundingClientRect();
    setViewBox(`0 0 ${containerBox.width} ${containerBox.height}`);

    const points: { day: number; x: number; y: number }[] = [];
    for (const day of days) {
      const el = nodeRefs.current.get(day.day_number);
      if (!el) continue;
      const box = el.getBoundingClientRect();
      points.push({
        day: day.day_number,
        x: box.left - containerBox.left + box.width / 2,
        y: box.top - containerBox.top + box.height / 2,
      });
    }

    const nextSegments: Segment[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      // Skip drawing a connector across a checkpoint break (large vertical jump
      // relative to card height means a full-width flag sits between them).
      const sameRow = Math.abs(a.y - b.y) < 12;
      const midX = (a.x + b.x) / 2;
      const d = sameRow
        ? `M ${a.x} ${a.y} L ${b.x} ${b.y}`
        : `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
      const active = a.day <= currentDay(days) && b.day <= currentDay(days) + 1;
      nextSegments.push({ d, active });
    }
    setSegments(nextSegments);
  }, [days]);

  useLayoutEffect(() => {
    recompute();
    const ro = new ResizeObserver(() => recompute());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  const checkpointByDay = new Map(checkpoints.map((c) => [c.day, c]));

  return (
    <div ref={containerRef} className="relative">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={viewBox}
        preserveAspectRatio="none"
        aria-hidden
      >
        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.d}
            fill="none"
            stroke={seg.active ? "rgb(var(--brass))" : "rgb(var(--border))"}
            strokeWidth={2}
            strokeDasharray="1 9"
            strokeLinecap="round"
            className={seg.active ? "animate-dash-flow" : ""}
          />
        ))}
      </svg>

      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {days.map((day) => {
          const checkpoint = checkpointByDay.get(day.day_number);
          return (
            <div key={day.day_number} className="contents">
              <div ref={setNodeRef(day.day_number)} className="relative z-10">
                <DayCard courseId={courseId} day={day} />
              </div>
              {checkpoint && (
                <div className="relative z-10 col-span-full">
                  <CheckpointFlag courseId={courseId} checkpoint={checkpoint} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function currentDay(days: CourseDaySummary[]): number {
  const unlocked = days.find((d) => d.status === "unlocked");
  if (unlocked) return unlocked.day_number;
  const completed = days.filter((d) => d.status === "completed");
  return completed.length ? completed[completed.length - 1].day_number : 1;
}
