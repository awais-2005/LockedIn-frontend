"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useDayChat } from "@/lib/queries";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";

interface Message {
  role: "user" | "tutor";
  text: string;
}

export function ChatPanel({ courseId, dayNumber, topicTitle }: { courseId: string; dayNumber: number; topicTitle: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chat = useDayChat(courseId, dayNumber);
  const listRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || chat.isPending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    chat.mutate(text, {
      onSuccess: (data) => {
        setMessages((m) => [...m, { role: "tutor", text: data.reply }]);
        requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }));
      },
      onError: () => {
        setMessages((m) => [...m, { role: "tutor", text: "Something went wrong reaching the tutor. Try asking again." }]);
      },
    });
  }

  return (
    <div className="flex h-[560px] flex-col rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-3">
        <p className="text-xs text-muted">
          This tutor only discusses <span className="text-ink">{topicTitle}</span> and won&apos;t write your
          challenge code for you.
        </p>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-muted">Ask about anything on today&apos;s topic.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-brass px-4 py-2.5 text-sm text-[#14171C]"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-bg px-4 py-2.5 text-sm text-ink"
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        {chat.isPending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-bg px-4 py-2.5">
              <Spinner className="h-3.5 w-3.5 text-muted" />
              <span className="text-xs text-muted">Thinking…</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about today's topic…"
          className="flex-1 rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brass-strong/50"
        />
        <Button type="submit" size="md" disabled={!input.trim() || chat.isPending}>
          Send
        </Button>
      </form>
    </div>
  );
}
