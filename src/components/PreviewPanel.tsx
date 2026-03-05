"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { GuidanceRule } from "@/lib/types";
import { useSpeechToText, VoiceListeningBar } from "./SpeechToText";

interface PreviewPanelProps {
  rules: GuidanceRule[];
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Drain interval: how often we flush buffer chars to React state (ms)
// ~20 re-renders/sec is plenty smooth without hammering ReactMarkdown
const TICK_INTERVAL_MS = 50;
// Characters released per tick — 8 chars × 20 ticks/sec ≈ 160 chars/sec
const CHARS_PER_TICK = 8;

export function PreviewPanel({ rules, onClose }: PreviewPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayContent, setDisplayContent] = useState("");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const userScrolledRef = useRef(false);
  const lastUserMsgRef = useRef<string | null>(null);

  // Character buffer for smooth streaming
  const bufferRef = useRef("");
  const displayedRef = useRef("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamingMsgIdRef = useRef<string | null>(null);

  // Start/stop the interval-based drain loop
  useEffect(() => {
    if (isStreaming) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          if (bufferRef.current.length > 0) {
            const chars = bufferRef.current.slice(0, CHARS_PER_TICK);
            bufferRef.current = bufferRef.current.slice(CHARS_PER_TICK);
            displayedRef.current += chars;
            setDisplayContent(displayedRef.current);
          }
        }, TICK_INTERVAL_MS);
      }
    } else {
      // Streaming ended — stop interval and flush
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (bufferRef.current.length > 0) {
        displayedRef.current += bufferRef.current;
        bufferRef.current = "";
      }
      if (displayedRef.current) {
        setDisplayContent(displayedRef.current);
      }

      // Sync final content to messages
      if (streamingMsgIdRef.current && displayedRef.current) {
        const finalContent = displayedRef.current;
        const msgId = streamingMsgIdRef.current;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, content: finalContent } : m
          )
        );
        streamingMsgIdRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStreaming]);

  // Detect if user has manually scrolled up during streaming
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !isStreaming) return;
    const el = scrollRef.current;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    userScrolledRef.current = !atBottom;
  }, [isStreaming]);

  // Scroll to show the user's message at the top when it first appears
  useEffect(() => {
    if (!lastUserMsgRef.current) return;
    const msgId = lastUserMsgRef.current;
    lastUserMsgRef.current = null;

    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const msgEl = el.querySelector(`[data-msg-id="${msgId}"]`);
      if (msgEl) {
        msgEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, [messages.length]);

  // Speech-to-text: transcript auto-sends as a chat message
  const {
    isListening,
    isProcessing,
    error: micError,
    startListening,
    stopListening,
    cancelListening,
    clearError: clearMicError,
    micStream,
  } = useSpeechToText((text) => handleSend(text));

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
    };

    // Reset buffer for new message
    bufferRef.current = "";
    displayedRef.current = "";
    setDisplayContent("");
    streamingMsgIdRef.current = assistantMsg.id;

    userScrolledRef.current = false;
    lastUserMsgRef.current = userMsg.id;
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
        bufferRef.current = "";
        displayedRef.current = `Error: ${text || res.statusText}`;
        setDisplayContent(displayedRef.current);
        setIsStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Push chunks into buffer — RAF loop releases them smoothly
        const chunk = decoder.decode(value, { stream: true });
        bufferRef.current += chunk;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      bufferRef.current = "";
      displayedRef.current = "Something went wrong. Please try again.";
      setDisplayContent(displayedRef.current);
    } finally {
      // Wait for buffer to drain before ending stream
      const waitForDrain = setInterval(() => {
        if (bufferRef.current.length === 0) {
          clearInterval(waitForDrain);
          setIsStreaming(false);
          abortRef.current = null;
        }
      }, TICK_INTERVAL_MS);
    }
  }

  function handleReset() {
    if (abortRef.current) abortRef.current.abort();
    bufferRef.current = "";
    displayedRef.current = "";
    streamingMsgIdRef.current = null;
    setDisplayContent("");
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
            <img src="/icons/refresh.svg" alt="" className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-container text-text-muted hover:bg-neutral-container-emphasis transition-colors duration-200"
            title="Close"
          >
            <img src="/icons/close.svg" alt="" className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Scrollable area — info cards + messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scroll-smooth px-4 pt-3 space-y-4">
        {/* Info cards — grouped with tighter spacing */}
        <div className="space-y-2">
          {/* Agent card — Fin header + test info, AI gradient border, square bottom-left */}
          <div className="card-gradient-border square-bl px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <img src="/icons/ai-automation.svg" alt="" className="w-5 h-5" />
              <div className="text-[13px] font-semibold text-[#20284D]">
                Fin &bull; AI Agent
              </div>
            </div>
            <p className="text-[13px] text-[#20284D] leading-5">
              👉 You can test your Guidance here to see how Fin would answer your customers&apos; questions.
            </p>
          </div>

          {/* Second info card — AI gradient border, square top-left */}
          <div className="card-gradient-border square-tl px-4 py-4">
            <p className="text-[13px] text-[#20284D] leading-5">
              Whenever you update a piece of Guidance, you can test it here without having to save or enable it.
            </p>
          </div>
        </div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            data-msg-id={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-up`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 text-[14px] leading-[1.45] ${
                msg.role === "user"
                  ? "bg-[#1F2937] text-white rounded-[20px] rounded-br-[6px]"
                  : "bg-[#F3F3F1] text-text-default rounded-[20px] rounded-bl-[6px]"
              }`}
            >
              {(() => {
                const isActiveStream = msg.id === streamingMsgIdRef.current && isStreaming;
                const text = isActiveStream ? displayContent : msg.content;

                if (text) {
                  return msg.role === "assistant" ? (
                    <div className="preview-markdown">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  ) : (
                    text
                  );
                }
                return (
                  <span className="inline-flex gap-1 py-1">
                    <span className="w-1.5 h-1.5 bg-text-disabled rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-text-disabled rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-text-disabled rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                );
              })()}
            </div>
            {msg.role === "assistant" && (msg.content || (msg.id === streamingMsgIdRef.current && displayContent)) && (
              <span className="text-[11px] text-text-disabled mt-1 ml-1">Fin &bull; just now</span>
            )}
          </div>
        ))}
      </div>

      {/* Mic permission error banner */}
      {micError && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-small bg-error-container text-text-error text-[12px] flex items-center justify-between">
          <span>{micError}</span>
          <button onClick={clearMicError} className="ml-2 text-text-error hover:opacity-70 shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      )}

      {/* Chat input — voice listening bar or standard text input */}
      <div className="px-4 pb-4 pt-0">
        {isListening ? (
          <>
            <VoiceListeningBar
              micStream={micStream}
              onStop={stopListening}
              onCancel={cancelListening}
            />
            <div className="flex items-center justify-center mt-2 gap-1.5">
              <img src="/icons/ai-automation.svg" alt="" className="w-3.5 h-3.5 opacity-40" />
              <span className="text-[11px] text-text-disabled">Powered by Fin</span>
            </div>
          </>
        ) : (
          <div className="bg-base-inputs border-2 border-neutral-border focus-within:border-neutral-fill rounded-[16px] pl-4 pr-3 pt-3 pb-3 transition-colors duration-200">
            <input
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-text-disabled text-text-default mb-2"
              placeholder={isProcessing ? "Transcribing..." : "Ask a question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isStreaming || isProcessing}
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
              <button
                onClick={startListening}
                disabled={isStreaming || isProcessing}
                className="text-text-disabled hover:text-text-muted transition-colors duration-200 disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="7" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 9a4 4 0 008 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9 13v3M7 16h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </button>
              <div className="flex-1" />
              {/* Send */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isStreaming || isProcessing}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 disabled:bg-neutral-container disabled:text-text-disabled bg-neutral-fill text-white hover:bg-neutral-fill-emphasis"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M8 4l-3.5 3.5M8 4l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
