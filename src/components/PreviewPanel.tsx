"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
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
    <aside className="w-96 bg-base-module rounded-large my-2 mr-2 shadow-level-0 flex flex-col shrink-0 animate-slide-in overflow-hidden">
      {/* Header — gray circle bg for "Preview", refresh and close icons, dotted line below */}
      <div className="flex items-center justify-between px-4 h-[65px] border-b border-dashed border-neutral-border">
        <h3 className="text-[20px] font-semibold text-text-default tracking-[-0.5px] leading-6">Preview</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-container text-text-muted hover:bg-neutral-container-emphasis transition-colors duration-200"
            title="Reset"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2.5 8a5.5 5.5 0 019.78-3.45M13.5 8a5.5 5.5 0 01-9.78 3.45" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M12.5 2v3h-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-container text-text-muted hover:bg-neutral-container-emphasis transition-colors duration-200"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      {/* Agent card — Fin header + test info, AI gradient border, square bottom-left */}
      <div className="card-gradient-border square-bl mx-4 mt-3 px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <img src="/icons/ai-automation.svg" alt="" className="w-5 h-5" />
          <div className="text-[13px] font-semibold text-text-default">
            Fin &bull; AI Agent
          </div>
        </div>
        <p className="text-[13px] text-text-default leading-5">
          👉 You can test your Guidance here to see how Fin would answer your customers&apos; questions.
        </p>
      </div>

      {/* Second info card — AI gradient border, square top-left */}
      <div className="card-gradient-border square-tl mx-4 mt-2 px-4 py-4">
        <p className="text-[13px] text-text-muted leading-5">
          Whenever you update a piece of Guidance, you can test it here without having to save or enable it.
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-up`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 text-[14px] leading-[1.45] ${
                msg.role === "user"
                  ? "bg-[#1F2937] text-white rounded-[20px] rounded-br-[6px]"
                  : "bg-[#F3F3F1] text-text-default rounded-[20px] rounded-bl-[6px]"
              }`}
            >
              {msg.content ? (
                msg.role === "assistant" ? (
                  <div className="preview-markdown">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )
              ) : (
                <span className="inline-flex gap-1 py-1">
                  <span className="w-1.5 h-1.5 bg-text-disabled rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-text-disabled rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-text-disabled rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </div>
            {msg.role === "assistant" && msg.content && (
              <span className="text-[11px] text-text-disabled mt-1 ml-1">Fin &bull; just now</span>
            )}
          </div>
        ))}
      </div>

      {/* Chat input — tall box with text on top, icons row below */}
      <div className="px-4 pb-4 pt-2">
        <div className="bg-base-inputs border-2 border-neutral-border focus-within:border-neutral-fill rounded-[16px] px-4 pt-3 pb-2 transition-colors duration-200">
          <input
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-text-disabled text-text-default mb-2"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isStreaming}
          />
          <div className="flex items-center gap-3">
            {/* Attach */}
            <button className="text-text-disabled hover:text-text-muted transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M8.5 5v6a2 2 0 004 0V5.5a3.5 3.5 0 00-7 0V12a5 5 0 0010 0V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
            {/* Emoji */}
            <button className="text-text-disabled hover:text-text-muted transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M6 11s1.2 1.8 3 1.8 3-1.8 3-1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="6.75" cy="7.5" r="0.85" fill="currentColor"/><circle cx="11.25" cy="7.5" r="0.85" fill="currentColor"/></svg>
            </button>
            {/* GIF */}
            <button className="text-text-disabled hover:text-text-muted transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><text x="9" y="11" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="700">GIF</text></svg>
            </button>
            {/* Microphone */}
            <button className="text-text-disabled hover:text-text-muted transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 9a4 4 0 008 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9 13v3M7 16h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
            <div className="flex-1" />
            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="text-text-disabled hover:text-accent-fill disabled:text-neutral-border transition-colors duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M16 2L8 10M16 2l-5 14-2.5-6.5L2 8l14-6z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
