"use client";

import { Navbar } from "@/components/Navbar";
import { NewCourseWizard } from "@/components/NewCourseWizard";

export default function NewCoursePage() {
  return (
    <div className="min-h-screen">
      <Navbar crumbs={[{ label: "New course" }]} />
      <main className="mx-auto max-w-2xl px-6 py-14">
        <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brass-strong">Add a course</p>
        <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Turn a document into a roadmap</h1>
        <NewCourseWizard />
      </main>
    </div>
  );
}
