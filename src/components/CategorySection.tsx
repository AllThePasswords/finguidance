"use client";

import { GuidanceRule, GuidanceCategory, CATEGORY_META } from "@/lib/types";
import { GuidanceEditor } from "./GuidanceEditor";

interface CategorySectionProps {
  category: GuidanceCategory;
  rules: GuidanceRule[];
  editingId: string | null;
  isCreating: boolean;
  draftTitle: string;
  draftContent: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onStartCreate: () => void;
  onStartEdit: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onSeeExamples: () => void;
}

/* ── Accordion wrapper for existing rules ──────────────────────────── */
function RuleAccordion({
  rule,
  isOpen,
  onToggle,
  children,
}: {
  rule: GuidanceRule;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-base-module border rounded-[16px] transition-all duration-300 ${
        isOpen
          ? "border-neutral-border shadow-level-1"
          : "border-neutral-border hover:border-neutral-border-emphasis hover:shadow-level-0"
      }`}
    >
      {/* Clickable header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-text-default text-[14px] leading-5">
                {rule.title}
              </h3>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-max font-medium transition-colors duration-200 ${
                  rule.enabled
                    ? "bg-success-container text-success-fill"
                    : "bg-neutral-container text-text-muted"
                }`}
              >
                {rule.enabled ? "Enabled" : "Not enabled"}
              </span>
            </div>

            {/* Stats + content preview — fade out when open */}
            <div
              className={`transition-all duration-300 ${
                isOpen ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 max-h-20"
              }`}
            >
              <div className="text-[12px] text-text-disabled mb-2 leading-4">
                Used: {rule.stats.used.toLocaleString()} &bull; Resolved:{" "}
                {rule.stats.resolvedPct}% &bull; Routed: {rule.stats.routedPct}%
              </div>
              <p className="text-[13px] text-text-muted leading-5 line-clamp-2">
                {rule.content}
              </p>
            </div>
          </div>

          {/* Disclosure arrow — rotates on open */}
          <img
            src="/icons/disclose.svg"
            alt=""
            className={`w-3 h-[7px] shrink-0 mt-1 transition-all duration-300 ${
              isOpen
                ? "rotate-180 opacity-60"
                : "-rotate-90 opacity-40 group-hover:opacity-60"
            }`}
          />
        </div>
      </button>

      {/* Expandable body — CSS Grid height animation */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CategorySection({
  category,
  rules,
  editingId,
  isCreating,
  draftTitle,
  draftContent,
  onTitleChange,
  onContentChange,
  onStartCreate,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleEnabled,
  onSeeExamples,
}: CategorySectionProps) {
  const meta = CATEGORY_META[category];

  return (
    <section className="py-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img src={meta.iconPath} alt="" className="w-4 h-4" />
          <h2 className="text-[14px] font-semibold text-text-default">
            {meta.label}
          </h2>
          <span className="text-[13px] text-text-disabled">({rules.length})</span>
        </div>
        <button
          onClick={onStartCreate}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-container text-text-default hover:bg-neutral-container-emphasis transition-all duration-200"
        >
          <img src="/icons/add.svg" alt="" className="w-3 h-3" />
        </button>
      </div>

      {/* Empty state — description + See examples */}
      {rules.length === 0 && !isCreating && (
        <div className="bg-base-module-subtle rounded-[12px] px-4 py-3">
          <span className="text-[13px] text-text-muted">
            {meta.description}
          </span>
          {"  "}
          <button onClick={onSeeExamples} className="text-[13px] text-text-default hover:underline font-medium">
            See examples &rsaquo;
          </button>
        </div>
      )}

      <div className="space-y-2">
        {rules.map((rule) => (
          <RuleAccordion
            key={rule.id}
            rule={rule}
            isOpen={editingId === rule.id}
            onToggle={() =>
              editingId === rule.id ? onCancel() : onStartEdit(rule.id)
            }
          >
            <GuidanceEditor
              rule={rule}
              category={category}
              draftTitle={draftTitle}
              draftContent={draftContent}
              onTitleChange={onTitleChange}
              onContentChange={onContentChange}
              onSave={onSave}
              onCancel={onCancel}
              onDelete={() => onDelete(rule.id)}
              onEnable={() => onToggleEnabled(rule.id)}
              isAccordion
            />
          </RuleAccordion>
        ))}

        {/* New rule editor */}
        {isCreating && (
          <GuidanceEditor
            category={category}
            draftTitle={draftTitle}
            draftContent={draftContent}
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSave={onSave}
            onCancel={onCancel}
            isNew
          />
        )}
      </div>
    </section>
  );
}
