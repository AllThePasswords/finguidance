"use client";

import { Sparkles, Trash2, X } from "lucide-react";
import { GuidanceRule, GuidanceCategory, CATEGORY_META } from "@/lib/types";

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
  onImprove,
  isNew,
}: GuidanceEditorProps) {
  const meta = CATEGORY_META[category];

  return (
    <div className="bg-base-module border border-accent-border rounded-small overflow-hidden shadow-level-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border">
        <div className="flex items-center gap-2">
          {isNew ? (
            <input
              className="text-[14px] font-semibold text-text-default bg-transparent border-none outline-none placeholder:text-text-disabled w-64"
              placeholder="Guidance title..."
              value={draftTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              autoFocus
            />
          ) : (
            <input
              className="text-[14px] font-semibold text-text-default bg-transparent border-none outline-none w-64"
              value={draftTitle}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          )}
          {rule && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-max font-medium ${
                rule.enabled ? "bg-success-container text-success-fill" : "bg-neutral-container text-text-muted"
              }`}
            >
              {rule.enabled ? "Enabled" : "Not enabled"}
            </span>
          )}
        </div>
        <button onClick={onCancel} className="text-text-disabled hover:text-text-muted transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <textarea
          className="w-full min-h-[100px] text-[13px] leading-5 text-text-muted bg-transparent border-none outline-none resize-none placeholder:text-text-disabled"
          placeholder={meta.placeholder}
          value={draftContent}
          onChange={(e) => onContentChange(e.target.value)}
          autoFocus={!isNew}
        />
      </div>

      {/* Example chips (for new rules) */}
      {isNew && (
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-text-disabled">Examples</span>
          {meta.examples.map((ex) => (
            <button
              key={ex}
              onClick={() => onTitleChange(ex)}
              className="text-[12px] px-3 py-1 bg-neutral-container hover:bg-neutral-container-emphasis text-text-default rounded-max transition-colors"
            >
              {ex}
            </button>
          ))}
          <button className="text-text-disabled hover:text-text-muted p-1 transition-colors">...</button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-border bg-base-module-subtle/50">
        <div className="flex items-center gap-2">
          {onImprove && (
            <button
              onClick={onImprove}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-accent-fill hover:text-accent-fill-emphasis bg-accent-container hover:bg-accent-container-emphasis px-3 py-1.5 rounded-small transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Improve
            </button>
          )}
          {!isNew && (
            <button className="text-[13px] text-text-muted hover:text-text-default px-2 py-1.5 transition-colors">
              Examples
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-text-disabled hover:text-error-fill p-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onCancel}
            className="text-[13px] text-text-muted hover:text-text-default px-3 py-1.5 rounded-small transition-colors"
          >
            Cancel
          </button>
          {onEnable && rule && !rule.enabled && (
            <button
              onClick={onEnable}
              className="flex items-center gap-1 text-[13px] font-semibold text-text-default bg-base-module border border-neutral-border hover:bg-neutral-container px-3 py-1.5 rounded-max transition-colors"
            >
              ▶ Enable
            </button>
          )}
          <button
            onClick={onSave}
            disabled={!draftContent.trim()}
            className="flex items-center gap-1 text-[13px] font-semibold text-neutral-text-on-fill bg-neutral-fill hover:bg-neutral-fill-emphasis disabled:bg-neutral-container disabled:text-text-disabled px-4 py-1.5 rounded-max transition-colors"
          >
            ✓ Save
          </button>
        </div>
      </div>
    </div>
  );
}
