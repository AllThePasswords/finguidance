"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { GuidanceCategory, GuidanceExample, CATEGORY_META } from "@/lib/types";

interface TemplatesModalProps {
  category: GuidanceCategory;
  onSelect: (example: GuidanceExample) => void;
  onClose: () => void;
}

export function TemplatesModal({ category, onSelect, onClose }: TemplatesModalProps) {
  const meta = CATEGORY_META[category];
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-in"
    >
      <div className="bg-base-module rounded-large shadow-level-0 w-full max-w-[900px] max-h-[80vh] flex flex-col overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dashed border-neutral-border">
          <h2 className="text-[16px] font-semibold text-text-default">
            {meta.label} templates
          </h2>
          <button
            onClick={onClose}
            className="text-text-disabled hover:text-text-muted transition-colors duration-200 p-1"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4">
            {meta.examples.map((example) => (
              <button
                key={example.title}
                onClick={() => {
                  onSelect(example);
                  onClose();
                }}
                className="text-left border border-neutral-border rounded-small p-5 hover:border-neutral-border-emphasis hover:shadow-level-0 transition-all duration-200 group"
              >
                <h3 className="text-[14px] font-semibold text-text-default mb-2 leading-5">
                  {example.title}
                </h3>
                <p className="text-[13px] text-text-muted leading-5 line-clamp-4">
                  {example.content}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
