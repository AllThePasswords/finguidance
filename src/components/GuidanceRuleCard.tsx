"use client";

import { GuidanceRule } from "@/lib/types";

interface GuidanceRuleCardProps {
  rule: GuidanceRule;
  isEditing: boolean;
  onEdit: (id: string) => void;
}

export function GuidanceRuleCard({ rule, isEditing, onEdit }: GuidanceRuleCardProps) {
  if (isEditing) return null;

  return (
    <button
      onClick={() => onEdit(rule.id)}
      className="w-full text-left bg-base-module border border-neutral-border rounded-small p-4 hover:border-neutral-border-emphasis hover:shadow-level-0 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-default text-[14px] leading-5">{rule.title}</h3>
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
          <div className="text-[12px] text-text-disabled mb-2 leading-4">
            Used: {rule.stats.used.toLocaleString()} &bull; Resolved: {rule.stats.resolvedPct}% &bull; Routed: {rule.stats.routedPct}%
          </div>
          <p className="text-[13px] text-text-muted leading-5 line-clamp-2">{rule.content}</p>
        </div>
        <img src="/icons/disclose.svg" alt="" className="w-3 h-[7px] shrink-0 mt-1 -rotate-90 opacity-40 group-hover:opacity-60 transition-opacity duration-200" />
      </div>
    </button>
  );
}
