"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IconRail } from "@/components/IconRail";
import { Sidebar } from "@/components/Sidebar";
import { CategorySection } from "@/components/CategorySection";
import { PreviewPanel } from "@/components/PreviewPanel";
import { useGuidanceStore } from "@/lib/store";
import { GuidanceCategory, GuidanceExample } from "@/lib/types";
import { TemplatesModal } from "@/components/TemplatesModal";

const CATEGORIES: GuidanceCategory[] = [
  "communication_style",
  "context_clarification",
  "handover_escalation",
  "everything_else",
];

function GuidancePageInner() {
  const searchParams = useSearchParams();
  const seeded = searchParams.get("seeded") === "1";
  const store = useGuidanceStore(!seeded);
  const [showPreview, setShowPreview] = useState(true);
  const [showLearnMenu, setShowLearnMenu] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<GuidanceCategory | null>(null);
  const learnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (learnRef.current && !learnRef.current.contains(e.target as Node)) {
        setShowLearnMenu(false);
      }
    }
    if (showLearnMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLearnMenu]);

  return (
    <div className="flex h-screen overflow-hidden bg-base-backdrop">
      {/* Icon rail */}
      <IconRail />

      {/* Sidebar navigation */}
      <Sidebar totalGuidanceCount={store.totalCount} />

      {/* Focus module (main content) */}
      <main className="flex-1 overflow-y-auto bg-base-module rounded-large shadow-level-0 my-2 mx-2">
        {/* Page header */}
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
              {/* Learn dropdown */}
              <div ref={learnRef} className="relative">
                <button
                  className="flex items-center gap-1 text-[14px] font-semibold text-text-default bg-neutral-container hover:bg-neutral-container-emphasis h-8 min-w-[32px] px-3 rounded-max transition-colors duration-200"
                  onClick={() => setShowLearnMenu(!showLearnMenu)}
                >
                  <img src="/icons/knowledge-learn.svg" alt="" className="w-4 h-4" />
                  Learn
                  <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className="shrink-0 ml-0.5"><path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {showLearnMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-[12px] shadow-level-1 py-1.5 z-20 animate-fade-up">
                    <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[14px] text-text-default hover:bg-neutral-container/50 transition-colors">
                      <img src="/icons/knowledge-learn.svg" alt="" className="w-4 h-4" />
                      Get started
                    </button>
                    <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[14px] text-text-default hover:bg-neutral-container/50 transition-colors">
                      <img src="/icons/knowledge-learn.svg" alt="" className="w-4 h-4" />
                      Best practices
                    </button>
                    <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[14px] text-text-default hover:bg-neutral-container/50 transition-colors">
                      <img src="/icons/knowledge-learn.svg" alt="" className="w-4 h-4" />
                      Fin&apos;s basics
                    </button>
                    <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[14px] text-text-default hover:bg-neutral-container/50 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4 shrink-0"><path d="M8 1L1 5l7 4 7-4-7-4zM1 8l7 4 7-4M1 11l7 4 7-4" stroke="#1A1A1A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Learn more
                    </button>
                  </div>
                )}
              </div>
              {!showPreview && (
                <button
                  className="flex items-center gap-1 text-[14px] font-semibold text-text-default bg-neutral-container hover:bg-neutral-container-emphasis h-8 min-w-[32px] px-3 rounded-max transition-colors duration-200"
                  onClick={() => setShowPreview(true)}
                >
                  Preview
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content — category sections */}
        <div className="px-6">
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
              onSeeExamples={() => setTemplateCategory(cat)}
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

      {/* Templates modal from "See examples" */}
      {templateCategory && (
        <TemplatesModal
          category={templateCategory}
          onSelect={(example: GuidanceExample) => {
            store.startCreate(templateCategory);
            store.setDraftTitle(example.title);
            store.setDraftContent(example.content);
          }}
          onClose={() => setTemplateCategory(null)}
        />
      )}
    </div>
  );
}

export function ClientPageRoot() {
  return (
    <Suspense>
      <GuidancePageInner />
    </Suspense>
  );
}
