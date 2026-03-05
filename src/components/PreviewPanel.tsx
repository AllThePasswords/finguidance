"use client";

import { useState, useRef, useEffect } from "react";
import { GuidanceRule } from "@/lib/types";

interface PreviewPanelProps {
  rules: GuidanceRule[];
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function PreviewPanel({ rules, onClose }: PreviewPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
    };

    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      abortRef.current = new AbortController();

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, rules }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `Error: ${text || res.statusText}` }
              : m
          )
        );
        setIsStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "Something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleReset() {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setIsStreaming(false);
  }

  return (
    <aside className="w-96 bg-base-module border-l border-neutral-border flex flex-col h-screen shrink-0 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border">
        <h3 className="text-[14px] font-semibold text-text-default">Preview</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="text-text-disabled hover:text-text-muted p-1 rounded-small transition-colors duration-200"
            title="Reset"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 8a5.5 5.5 0 019.78-3.45M13.5 8a5.5 5.5 0 01-9.78 3.45" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M12.5 2v3h-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={onClose}
            className="text-text-disabled hover:text-text-muted p-1 rounded-small transition-colors duration-200"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      {/* Agent header */}
      <div className="px-4 py-3 border-b border-neutral-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-neutral-fill flex items-center justify-center">
            <img src="/icons/ai-automation.svg" alt="" className="w-4 h-4 invert" />
          </div>
          <div className="text-[13px] font-semibold text-text-default">
            Fin &bull; AI Agent
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-3 p-3 bg-accent-container border border-accent-border rounded-small">
        <p className="text-[12px] text-accent-fill-emphasis leading-4">
          You can test your Guidance here to see how Fin would answer your customers&apos; questions.
        </p>
      </div>

      {/* Active rules indicator */}
      <div className="mx-4 mt-2 p-3 bg-accent-container/50 border border-accent-border/50 rounded-small">
        <p className="text-[12px] text-text-muted leading-4">
          Whenever you update a piece of Guidance, you can test it here without having to save or enable it.
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-neutral-fill flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <img src="/icons/ai-automation.svg" alt="" className="w-3.5 h-3.5 invert" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-small px-3 py-2 text-[13px] leading-5 ${
                msg.role === "user"
                  ? "bg-neutral-fill text-neutral-text-on-fill"
                  : "bg-neutral-container text-text-default"
              }`}
            >
              {msg.content || (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-text-disabled rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-text-disabled rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-text-disabled rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-border p-3">
        <div className="flex items-center gap-2 bg-base-inputs border border-neutral-border rounded-small px-3 py-2">
          <input
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-text-disabled text-text-default"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="text-text-disabled hover:text-accent-fill disabled:text-neutral-border transition-colors duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 2L7 9M14 2l-4.5 12-2-5.5L2 7l12-5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
