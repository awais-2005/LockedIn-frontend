import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,480px)_1fr]">
      <div className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 bg-contour opacity-[0.35]"
          aria-hidden
        />
        <div className="relative flex items-center gap-2">
          <TrailMark className="h-5 w-5 text-brass" />
          <span className="font-display text-lg font-semibold text-ink">RoadmapAI</span>
        </div>

        <div className="relative">
          <RouteArt />
          <p className="mt-10 font-display text-3xl font-semibold leading-tight text-ink">
            Every course, walked one locked day at a time.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Upload what you&apos;re learning. RoadmapAI paces it into days, gates each one behind the last, and
            checks your footing at every waypoint.
          </p>
        </div>

        <p className="relative font-mono text-xs text-muted">© {new Date().getFullYear()} RoadmapAI</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brass-strong">{eyebrow}</p>
          <h1 className="mb-2 font-display text-2xl font-semibold text-ink">{title}</h1>
          <p className="mb-8 text-sm text-muted">{subtitle}</p>
          {children}
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

function TrailMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 19c3-1 3-6 6-6s3 5 6 5 3-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="3" cy="19" r="1.6" fill="currentColor" />
      <circle cx="21" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

function RouteArt() {
  return (
    <svg viewBox="0 0 380 140" fill="none" className="w-full max-w-sm text-border">
      <path
        d="M10 120c40-10 50-70 90-70s50 60 90 60 50-90 90-90 60 50 90 50"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      {[10, 100, 190, 280, 370].map((x, i) => (
        <circle key={i} cx={x} cy={i % 2 === 0 ? 120 - i * 5 : 50} r="4" className="fill-brass" />
      ))}
    </svg>
  );
}
