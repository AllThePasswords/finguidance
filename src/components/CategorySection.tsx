"use client";

import { GuidanceRule, GuidanceCategory, CATEGORY_META } from "@/lib/types";
import { GuidanceRuleCard } from "./GuidanceRuleCard";
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
          <button onClick={onStartCreate} className="text-[13px] text-text-default hover:underline font-medium">
            See examples &rsaquo;
          </button>
        </div>
      )}

      <div className="space-y-2">
        {rules.map((rule) =>
          editingId === rule.id ? (
            <GuidanceEditor
              key={rule.id}
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
            />
          ) : (
            <GuidanceRuleCard
              key={rule.id}
              rule={rule}
              isEditing={false}
              onEdit={onStartEdit}
            />
          )
        )}

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
