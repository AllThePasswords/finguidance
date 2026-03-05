"use client";

import { Plus } from "lucide-react";
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
    <section className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[14px]">{meta.icon}</span>
          <h2 className="text-[14px] font-semibold text-text-default">
            {meta.label}
          </h2>
          <span className="text-[13px] text-text-disabled">({rules.length})</span>
        </div>
        <button
          onClick={onStartCreate}
          className="text-text-disabled hover:text-text-muted hover:bg-neutral-container p-1 rounded-small transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Rules or empty state */}
      {rules.length === 0 && !isCreating && (
        <div className="text-[13px] text-text-disabled py-2 pl-1">
          {meta.description}{" "}
          <button onClick={onStartCreate} className="text-accent-fill hover:underline">
            See examples ›
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
              onImprove={() => {}}
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
