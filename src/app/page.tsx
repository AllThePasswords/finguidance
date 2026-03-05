"use client";

import { useState } from "react";
import { IconRail } from "@/components/IconRail";
import { Sidebar } from "@/components/Sidebar";
import { CategorySection } from "@/components/CategorySection";
import { PreviewPanel } from "@/components/PreviewPanel";
import { useGuidanceStore } from "@/lib/store";
import { GuidanceCategory } from "@/lib/types";

const CATEGORIES: GuidanceCategory[] = [
  "communication_style",
  "context_clarification",
  "handover_escalation",
  "everything_else",
];

export default function GuidancePage() {
  const store = useGuidanceStore();
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-base-backdrop">
      {/* Icon rail */}
      <IconRail />

      {/* Sidebar navigation */}
      <Sidebar totalGuidanceCount={store.totalCount} />

      {/* Focus module (main content) - Figma: bg-white, rounded-large, shadow-level-0 */}
      <main className="flex-1 overflow-y-auto bg-base-module rounded-large shadow-level-0">
        {/* Page header - Figma: px-24 py-16 */}
        <div className="sticky top-0 z-10 bg-base-module border-b border-dashed border-neutral-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center w-8 h-8 rounded-max hover:bg-neutral-container transition-colors duration-200">
                <img src="/icons/sidebar-close.svg" alt="" className="w-4 h-4" />
              </button>
              <h1 className="text-[20px] font-semibold text-text-default tracking-[-0.5px] leading-6">
                Guidance
              </h1>
              <span className="text-[10px] bg-beta-container text-beta-fill px-2 py-0.5 rounded-max font-medium">
                Beta
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="flex items-center gap-1 text-[14px] font-semibold text-text-default bg-neutral-container hover:bg-neutral-container-emphasis h-8 min-w-[32px] px-2 rounded-max transition-colors duration-200"
              >
                <img src="/icons/new-window.svg" alt="" className="w-4 h-4" />
              </button>
              <button
                className="flex items-center gap-1 text-[14px] font-semibold text-text-default bg-neutral-container hover:bg-neutral-container-emphasis h-8 min-w-[32px] px-3 rounded-max transition-colors duration-200"
                onClick={() => setShowPreview(!showPreview)}
              >
                <img src="/icons/knowledge-learn.svg" alt="" className="w-4 h-4" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>
          </div>
        </div>

        {/* Category sections - Figma: px-24 py-24 */}
        <div className="px-6 py-6 max-w-3xl">
          {CATEGORIES.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              rules={store.rulesByCategory(cat)}
              editingId={store.editingId}
              isCreating={store.creatingCategory === cat}
              draftTitle={store.draftTitle}
              draftContent={store.draftContent}
              onTitleChange={store.setDraftTitle}
              onContentChange={store.setDraftContent}
              onStartCreate={() => store.startCreate(cat)}
              onStartEdit={store.startEdit}
              onSave={store.saveRule}
              onCancel={store.cancelEdit}
              onDelete={store.deleteRule}
              onToggleEnabled={store.toggleEnabled}
            />
          ))}
        </div>
      </main>

      {/* Preview panel */}
      {showPreview && (
        <PreviewPanel
          rules={store.rules}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
