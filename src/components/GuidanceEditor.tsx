"use client";

import { useState, useCallback } from "react";
import { GuidanceRule, GuidanceCategory, CATEGORY_META } from "@/lib/types";
import { ChipTooltip } from "./ChipTooltip";
import { TemplatesModal } from "./TemplatesModal";

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
  isAccordion?: boolean;
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
  isAccordion,
}: GuidanceEditorProps) {
  const meta = CATEGORY_META[category];

  const [improveState, setImproveState] = useState<ImproveState>("idle");
  const [improvedContent, setImprovedContent] = useState("");
  const [improvementReason, setImprovementReason] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [showReason, setShowReason] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

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

  /* Shared body: textarea + improve banner + templates modal + action bar */
  const editorBody = (
    <>
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
            if (improveState === "improved") {
              setImproveState("idle");
            }
          }}
          autoFocus={!isNew}
          readOnly={improveState === "checking"}
        />
      </div>

      {/* "We've rephrased" banner */}
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

      {/* Templates modal */}
      {showTemplatesModal && (
        <TemplatesModal
          category={category}
          onSelect={(example) => {
            onTitleChange(example.title);
            onContentChange(example.content);
          }}
          onClose={() => setShowTemplatesModal(false)}
        />
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-base-module">
        {isNew && !draftTitle.trim() && !draftContent.trim() && improveState === "idle" ? (
          <div className="flex items-center gap-2 flex-wrap animate-in">
            <span className="text-[14px] leading-5 text-text-disabled">Examples</span>
            {meta.examples.slice(0, 3).map((ex) => (
              <ChipTooltip key={ex.title} title={ex.title} content={ex.content}>
                <button
                  onClick={() => {
                    onTitleChange(ex.title);
                    onContentChange(ex.content);
                  }}
                  className="text-[14px] leading-5 font-bold px-4 py-2 border border-neutral-border hover:border-neutral-border-emphasis hover:bg-neutral-container/30 text-text-default rounded-max transition-colors duration-200"
                >
                  {ex.title}
                </button>
              </ChipTooltip>
            ))}
            {meta.examples.length > 3 && (
              <ChipTooltip title="All templates">
                <button
                  onClick={() => setShowTemplatesModal(true)}
                  className="flex items-center justify-center w-9 h-9 border border-neutral-border hover:border-neutral-border-emphasis hover:bg-neutral-container/30 rounded-full transition-colors duration-200"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="4" cy="8" r="1.2" fill="currentColor" className="text-text-muted"/>
                    <circle cx="8" cy="8" r="1.2" fill="currentColor" className="text-text-muted"/>
                    <circle cx="12" cy="8" r="1.2" fill="currentColor" className="text-text-muted"/>
                  </svg>
                </button>
              </ChipTooltip>
            )}
          </div>
        ) : improveState === "improved" ? (
          <>
            <div className="flex items-center gap-2 animate-in">
              <button className="flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-default px-2 py-1.5 rounded-max transition-colors duration-200">
                Give feedback
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2.5 4l2.5 2.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 animate-in">
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
          <>
            <div className="flex items-center gap-2 animate-in">
              {improveState === "checking" ? (
                <button
                  onClick={handleViewOriginal}
                  className="btn-gradient-border flex items-center gap-1.5 text-[13px] font-semibold text-text-default px-3 py-1.5 rounded-max transition-all duration-200 hover:bg-neutral-container/50"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="3" width="10" height="10" rx="2" fill="url(#stop-grad)"/>
                    <defs>
                      <linearGradient id="stop-grad" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FCAE88"/>
                        <stop offset="0.5" stopColor="#DB57A2"/>
                        <stop offset="1" stopColor="#620777"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  Stop
                </button>
              ) : (
                <>
                  <button
                    onClick={handleImprove}
                    disabled={!draftContent.trim()}
                    className="btn-gradient-border flex items-center gap-1.5 text-[13px] font-semibold text-text-default px-3 py-1.5 rounded-max transition-all duration-200 hover:bg-neutral-container/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M15.7775 5.68248L12.7575 4.6725C12.0875 4.4525 11.5675 3.92249 11.3375 3.25249L10.3275 0.2325C10.2275 -0.0775 9.7875 -0.0775 9.6875 0.2325L8.6775 3.25249C8.4575 3.92249 7.9275 4.4525 7.2575 4.6725L4.2375 5.68248C3.9275 5.78248 3.9275 6.2225 4.2375 6.3225L7.2575 7.33248C7.9275 7.55248 8.4575 8.08249 8.6775 8.75249L9.6875 11.7725C9.7875 12.0825 10.2275 12.0825 10.3275 11.7725L11.3375 8.75249C11.5575 8.08249 12.0875 7.55248 12.7575 7.33248L15.7775 6.3225C16.0875 6.2225 16.0875 5.78248 15.7775 5.68248ZM7.2875 11.9525L5.8775 11.4825C5.2375 11.2725 4.7375 10.7725 4.5275 10.1325L4.0575 8.72249C3.9575 8.43249 3.5475 8.43249 3.4475 8.72249C3.3075 9.13249 3.1375 9.64249 2.9775 10.1325C2.7675 10.7725 2.2675 11.2725 1.6275 11.4825L0.2175 11.9525C-0.0725 12.0525 -0.0725 12.4625 0.2175 12.5625C0.6275 12.7025 1.1375 12.8725 1.6275 13.0325C2.2675 13.2425 2.7675 13.7425 2.9775 14.3825C3.1375 14.8725 3.3075 15.3825 3.4475 15.7925C3.5475 16.0825 3.9575 16.0825 4.0575 15.7925L4.5275 14.3825C4.7375 13.7425 5.2375 13.2425 5.8775 13.0325C6.3675 12.8725 6.8775 12.7025 7.2875 12.5625C7.5775 12.4625 7.5775 12.0525 7.2875 11.9525Z" fill="url(#improve-grad)"/>
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
                  <button
                    onClick={() => setShowTemplatesModal(true)}
                    className="text-[13px] text-text-muted hover:text-text-default px-2 py-1.5 transition-colors duration-200"
                  >
                    Examples
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 animate-in">
              {onDelete && improveState === "idle" && (
                <button
                  onClick={onDelete}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-container hover:bg-neutral-container-emphasis transition-colors duration-200"
                  title="Delete"
                >
                  <img src="/icons/trash.svg" alt="Delete" className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onCancel}
                className="text-[13px] font-semibold text-text-default bg-neutral-container hover:bg-neutral-container-emphasis px-3 py-1.5 rounded-max transition-colors duration-200"
              >
                Cancel
              </button>
              {onEnable && rule && !rule.enabled && improveState === "idle" && (
                <button
                  onClick={onEnable}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-text-default bg-neutral-container hover:bg-neutral-container-emphasis px-3 py-1.5 rounded-max transition-colors duration-200"
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
    </>
  );

  // Accordion mode: body only, wrapper provided by RuleAccordion
  if (isAccordion) {
    return (
      <div className="border-t border-neutral-border">
        {editorBody}
      </div>
    );
  }

  // Standalone mode (new rule): full container with header
  return (
    <div className="bg-base-module border border-neutral-border rounded-large overflow-hidden shadow-level-1 animate-in">
      {/* Header — title input + close button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            className="text-[14px] font-semibold text-text-default bg-transparent border-none outline-none placeholder:text-text-disabled flex-1 min-w-0"
            placeholder="Guidance title..."
            value={draftTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            autoFocus
          />
        </div>
        <button onClick={onCancel} className="hover:opacity-70 transition-opacity duration-200 p-1 ml-2 shrink-0">
          <img src="/icons/close.svg" alt="Close" className="w-[11px] h-[11px]" />
        </button>
      </div>
      {editorBody}
    </div>
  );
}
