"use client";

import { useState } from "react";
import { RotateCcw, X, Bot, Send } from "lucide-react";
import { GuidanceRule } from "@/lib/types";

interface PreviewPanelProps {
  rules: GuidanceRule[];
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export function PreviewPanel({ rules, onClose }: PreviewPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const enabledRules = rules.filter((r) => r.enabled);

  function handleSend() {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
    };

    const relevantRules = enabledRules.filter(
      (r) =>
        r.content.toLowerCase().includes(input.toLowerCase().split(" ")[0]) ||
        Math.random() > 0.5
    );

    const responseText = relevantRules.length > 0
      ? `Based on your guidance rules, I would respond considering: ${relevantRules
          .slice(0, 2)
          .map((r) => `"${r.title}"`)
          .join(" and ")}. Here's a sample response that follows those guidelines.`
      : "I would respond to this question using your knowledge base content, applying any relevant enabled guidance rules.";

    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: responseText,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  }

  function handleReset() {
    setMessages([]);
  }

  return (
    <aside className="w-96 bg-base-module border-l border-neutral-border flex flex-col h-screen shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border">
        <h3 className="text-[14px] font-semibold text-text-default">Preview</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="text-text-disabled hover:text-text-muted p-1 rounded-small transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-text-disabled hover:text-text-muted p-1 rounded-small transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Agent header */}
      <div className="px-4 py-3 border-b border-neutral-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-neutral-fill flex items-center justify-center">
            <Bot className="w-4 h-4 text-neutral-text-on-fill" />
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
      <div className="mx-4 mt-2 p-3 bg-error-container border border-error-container rounded-small">
        <p className="text-[12px] text-error-fill leading-4">
          Whenever you update a piece of Guidance, you can test it here without having to save or enable it.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-small px-3 py-2 text-[13px] leading-5 ${
                msg.role === "user"
                  ? "bg-neutral-fill text-neutral-text-on-fill"
                  : "bg-neutral-container text-text-default"
              }`}
            >
              {msg.content}
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
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="text-text-disabled hover:text-accent-fill disabled:text-neutral-border transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
