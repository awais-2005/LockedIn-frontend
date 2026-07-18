import type { Metadata } from "next";
import { plexMono, plexSans, spectral } from "./fonts";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoadmapAI — your course, one day at a time",
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
