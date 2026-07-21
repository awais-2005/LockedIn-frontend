"use client";

import { useCallback, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useSubmitChallenge } from "@/lib/queries";
import type { Challenge, ChallengeSubmitResult } from "@/lib/types";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import { cn } from "@/lib/utils";

const PASTE_MESSAGES = [
  "Nice try — this one's on you, not your clipboard.",
  "Ctrl+V doesn't count as understanding it.",
  "The trail doesn't shortcut. Type it out.",
];

export function CodeEditor({
  courseId,
  dayNumber,
  challenge,
  onResult,
}: {
  courseId: string;
  dayNumber: number;
  challenge: Challenge;
  onResult?: (result: ChallengeSubmitResult) => void;
}) {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = useState(challenge.submitted_answer ?? "");
  const [result, setResult] = useState<ChallengeSubmitResult | null>(
    challenge.is_solved ? { is_correct: true, feedback: "Already solved — nice work." } : null
  );
  const submit = useSubmitChallenge(courseId, dayNumber);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const blockPaste = useCallback(() => {
    const msg = PASTE_MESSAGES[Math.floor(Math.random() * PASTE_MESSAGES.length)];
    toast(msg);
  }, []);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // Best-effort backstop for Ctrl+V / Cmd+V. Note: this is a deterrent, not
      // a real guarantee — a determined user can still paste via the OS or
      // devtools. The onPaste handler on the DOM node below is the primary block.
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
        blockPaste();
      });

      const domNode = editor.getDomNode();
      domNode?.addEventListener("paste", (e) => {
        e.preventDefault();
        blockPaste();
      });
      domNode?.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
    },
    [blockPaste]
  );

  function handleSubmit() {
    if (challenge.is_solved || !code.trim() || submit.isPending) return;
    submit.mutate(
      { challengeId: challenge.id, content: code },
      {
        onSuccess: (data) => {
          setResult(data);
          onResult?.(data);
        },
        onError: () => toast.error("Couldn't submit right now — try again."),
      }
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            {challenge.type === "coding_expert" ? "Expert" : "Medium"} · {challenge.language ?? "code"}
          </p>
        </div>
        <p className="text-xs text-muted">Your code is reviewed by AI, not run.</p>
      </div>

      <div className="px-5 pt-4 text-sm text-ink/90">{challenge.prompt}</div>

      <div className="monaco-shell mt-4 overflow-hidden rounded-b-none border-t border-border">
        <Editor
          height="420px"
          language={mapLanguage(challenge.language)}
          theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          onMount={handleMount}
          options={{
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            minimap: { enabled: false },
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            contextmenu: false,
            automaticLayout: true,
            readOnly: challenge.is_solved,
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
        <p className="text-xs text-muted">Paste is disabled here — write it out.</p>
        <Button onClick={handleSubmit} disabled={challenge.is_solved || !code.trim() || submit.isPending}>
          {submit.isPending ? <Spinner className="text-[#14171C]" /> : challenge.is_solved ? "Solved" : "Submit"}
        </Button>
      </div>

      {result && (
        <div
          className={cn(
            "m-5 mt-0 rounded-lg border p-4 text-sm",
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

function mapLanguage(language: string | null): string {
  if (!language) return "plaintext";
  const l = language.toLowerCase();
  if (["js", "javascript"].includes(l)) return "javascript";
  if (["ts", "typescript"].includes(l)) return "typescript";
  if (["py", "python"].includes(l)) return "python";
  if (l === "c++") return "cpp";
  return l;
}
