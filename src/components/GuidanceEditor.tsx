"use client";

import { useState, useCallback } from "react";
import { GuidanceRule, GuidanceCategory, CATEGORY_META } from "@/lib/types";

type ImproveState = "idle" | "checking" | "improved";

interface GuidanceEditorProps {
  rule?: GuidanceRule;
  category: GuidanceCategory;
  draftTitle: string;
  draftContent: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onEnable?: () => void;
  onImprove?: () => void;
  isNew?: boolean;
}

export function GuidanceEditor({
  rule,
  category,
  draftTitle,
  draftContent,
  onTitleChange,
  onContentChange,
  onSave,
  onCancel,
  onDelete,
  onEnable,
  isNew,
}: GuidanceEditorProps) {
  const meta = CATEGORY_META[category];

  const [improveState, setImproveState] = useState<ImproveState>("idle");
  const [improvedContent, setImprovedContent] = useState("");
  const [improvementReason, setImprovementReason] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [showReason, setShowReason] = useState(false);

  const handleImprove = useCallback(async () => {
    if (!draftContent.trim()) return;

    setOriginalContent(draftContent);
    setImproveState("checking");
    setShowReason(false);

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draftContent }),
      });

      if (!res.ok) throw new Error("Failed to improve");

      const data = await res.json();
      setImprovedContent(data.improved);
      setImprovementReason(data.reason);
      onContentChange(data.improved);
      setImproveState("improved");
    } catch {
      // On error, revert to idle
      setImproveState("idle");
    }
  }, [draftContent, onContentChange]);

  const handleUseThis = useCallback(() => {
    // Content is already set to improved version
    setImproveState("idle");
    setImprovedContent("");
    setImprovementReason("");
    setOriginalContent("");
  }, []);

  const handleViewOriginal = useCallback(() => {
    onContentChange(originalContent);
    setImproveState("idle");
    setImprovedContent("");
    setImprovementReason("");
    setOriginalContent("");
  }, [originalContent, onContentChange]);

  return (
    <div className="bg-base-module border border-neutral-border rounded-small overflow-hidden shadow-level-0 animate-in">
      {/* Header — title + enabled badge inline */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isNew ? (
            <input
              className="text-[14px] font-semibold text-text-default bg-transparent border-none outline-none placeholder:text-text-disabled flex-1 min-w-0"
              placeholder="Guidance title..."
              value={draftTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              autoFocus
            />
          ) : (
            <input
              className="text-[14px] font-semibold text-text-default bg-transparent border-none outline-none flex-1 min-w-0"
              value={draftTitle}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          )}
          {rule && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-max font-medium shrink-0 ${
                rule.enabled ? "bg-success-container text-success-fill" : "bg-neutral-container text-text-muted"
              }`}
            >
              {rule.enabled ? "Enabled" : "Not enabled"}
            </span>
          )}
        </div>
        <button onClick={onCancel} className="text-text-disabled hover:text-text-muted transition-colors duration-200 p-1 ml-2 shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <textarea
          className={`w-full min-h-[100px] text-[13px] leading-5 bg-transparent border-none outline-none resize-none placeholder:text-text-disabled transition-colors duration-300 ${
            improveState === "checking"
              ? "shimmer-text"
              : "text-text-muted"
          }`}
          placeholder={meta.placeholder}
          value={draftContent}
          onChange={(e) => {
            onContentChange(e.target.value);
            // If user manually edits during improved state, revert to idle
            if (improveState === "improved") {
              setImproveState("idle");
            }
          }}
          autoFocus={!isNew}
          readOnly={improveState === "checking"}
        />
      </div>

      {/* "We've rephrased" banner — shown in improved state */}
      {improveState === "improved" && (
        <div className="mx-4 mb-3 animate-fade-up">
          <button
            onClick={() => setShowReason(!showReason)}
            className="flex items-center gap-2 text-[13px] font-semibold text-text-default hover:text-text-muted transition-colors duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 5v1M8 8v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            We&apos;ve rephrased the guidance.{" "}
            <span className="text-text-muted font-normal">See why</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`transition-transform duration-200 ${showReason ? "rotate-180" : ""}`}
            >
              <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showReason && (
            <p className="mt-2 text-[13px] text-text-muted leading-5 animate-fade-up">
              {improvementReason}
            </p>
          )}
        </div>
      )}

      {/* Example chips (for new rules) */}
      {isNew && improveState === "idle" && (
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-text-disabled">Examples</span>
          {meta.examples.map((ex) => (
            <button
              key={ex}
              onClick={() => onTitleChange(ex)}
              className="text-[12px] px-3 py-1 bg-neutral-container hover:bg-neutral-container-emphasis text-text-default rounded-max transition-colors duration-200"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Actions — changes based on improve state */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-border bg-base-module-subtle/50">
        {improveState === "improved" ? (
          /* Improved state actions */
          <>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-default px-2 py-1.5 rounded-max transition-colors duration-200">
                Give feedback
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2.5 4l2.5 2.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleViewOriginal}
                className="flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-default px-3 py-1.5 rounded-max transition-colors duration-200"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7a5 5 0 019.33-2.5M12 7a5 5 0 01-9.33 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M11 2v2.5h-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                View original
              </button>
              <button
                onClick={handleUseThis}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-text-on-fill bg-neutral-fill hover:bg-neutral-fill-emphasis px-4 py-1.5 rounded-max transition-colors duration-200"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Use this
              </button>
            </div>
          </>
        ) : (
          /* Idle / Checking state actions */
          <>
            <div className="flex items-center gap-2">
              {improveState === "checking" ? (
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-text-muted px-3 py-1.5">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="animate-spin-slow">
                    <path d="M8 2l1.09 3.36h3.53l-2.86 2.08 1.1 3.36L8 8.72l-2.86 2.08 1.1-3.36L3.38 5.36h3.53L8 2z" fill="currentColor"/>
                    <path d="M13 1l.5 1.5H15l-1.2.87.46 1.42L13 3.92l-1.26.87.46-1.42L11 2.5h1.5L13 1z" fill="currentColor" opacity="0.7"/>
                  </svg>
                  Checking content...
                </div>
              ) : (
                <>
                  {!isNew && (
                    <button
                      onClick={handleImprove}
                      disabled={!draftContent.trim()}
                      className="btn-gradient-border flex items-center gap-1.5 text-[13px] font-semibold text-text-default px-3 py-1.5 rounded-max transition-all duration-200 hover:bg-neutral-container/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2l1.09 3.36h3.53l-2.86 2.08 1.1 3.36L8 8.72l-2.86 2.08 1.1-3.36L3.38 5.36h3.53L8 2z" fill="url(#improve-grad)"/>
                        <path d="M13 1l.5 1.5H15l-1.2.87.46 1.42L13 3.92l-1.26.87.46-1.42L11 2.5h1.5L13 1z" fill="url(#improve-grad)" opacity="0.7"/>
                        <path d="M3.5 11l.36 1.09h1.14l-.93.68.36 1.09L3.5 13.18l-.93.68.36-1.09-.93-.68h1.14L3.5 11z" fill="url(#improve-grad)" opacity="0.5"/>
                        <defs>
                          <linearGradient id="improve-grad" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FCAE88"/>
                            <stop offset="0.5" stopColor="#DB57A2"/>
                            <stop offset="1" stopColor="#620777"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      Improve
                    </button>
                  )}
                  {!isNew && (
                    <button className="text-[13px] text-text-muted hover:text-text-default px-2 py-1.5 transition-colors duration-200">
                      Examples
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onDelete && improveState === "idle" && (
                <button
                  onClick={onDelete}
                  className="text-text-disabled hover:text-error-fill p-1.5 transition-colors duration-200"
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v8a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
              <button
                onClick={onCancel}
                className="text-[13px] text-text-muted hover:text-text-default px-3 py-1.5 rounded-max transition-colors duration-200"
              >
                Cancel
              </button>
              {onEnable && rule && !rule.enabled && improveState === "idle" && (
                <button
                  onClick={onEnable}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-text-default bg-base-module border border-neutral-border hover:bg-neutral-container px-3 py-1.5 rounded-max transition-colors duration-200"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 2l7 4-7 4V2z" fill="currentColor"/></svg>
                  Enable
                </button>
              )}
              <button
                onClick={onSave}
                disabled={!draftContent.trim() || improveState === "checking"}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-text-on-fill bg-neutral-fill hover:bg-neutral-fill-emphasis disabled:bg-neutral-container disabled:text-text-disabled px-4 py-1.5 rounded-max transition-colors duration-200"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
