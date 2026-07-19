import type { Metadata } from "next";
import { plexMono, plexSans, spectral } from "./fonts";
import { Providers } from "./providers";
import "./globals.css";

const taglines = [
  "no days off, no shortcuts",
  "discipline over motivation",
  "show up. lock in. never break the chain.",
  "the grind doesn't skip days",
  "unlock tomorrow by mastering today",
  "stay locked, keep unlocking",
  "every day earned is a day unlocked",
  "discipline is the only key",
  "where consistency becomes character",
  "build the streak. become unstoppable.",
  "one day at a time, no version of you left behind",
];

const index = Math.floor(Math.random() * taglines.length);

export const metadata: Metadata = {
  title: `LockedIn — ${taglines[index]}`,
  description:
    "Turn any course document into a locked, day-by-day learning path with AI lessons, a scoped tutor, and checkpoint quizzes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spectral.variable} ${plexSans.variable} ${plexMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
