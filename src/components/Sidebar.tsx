"use client";

import {
  Bot,
  Eye,
  BookOpen,
  MessageSquare,
  BarChart3,
  Workflow,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  totalGuidanceCount: number;
}

export function Sidebar({ totalGuidanceCount }: SidebarProps) {
  return (
    <aside className="w-[247px] bg-base-module-subtle rounded-large shadow-level-0 flex flex-col h-screen shrink-0 overflow-clip">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center pl-2">
          <h2 className="text-[20px] font-semibold text-text-default tracking-[-0.5px] leading-6">
            AI &amp; Automation
          </h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 text-[13px] overflow-y-auto">
        {/* Fin AI Agent section */}
        <div className="flex items-center justify-between px-3 py-1 rounded-small">
          <div className="flex items-center gap-2 h-6">
            <Bot className="w-4 h-4 text-text-default" />
            <span className="font-semibold text-text-default">Fin AI Agent</span>
          </div>
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </div>

        {/* Sub items */}
        <div className="flex flex-col">
          <SubItem label="Overview" />
          <SubItem
            label="Guidance"
            active
            badge={String(totalGuidanceCount)}
            badgeVariant="beta"
          />
          <SubItem label="Custom answers" badge="18" />
          <SubItem label="Conversations" external />
          <SubItem label="Usage" external />
        </div>

        {/* Other sections */}
        <div className="pt-2 space-y-0.5">
          <SectionItem icon={Workflow} label="Workflows" />
          <SectionItem icon={LayoutGrid} label="Basics" />
        </div>
      </nav>
    </aside>
  );
}

function SubItem({
  label,
  active,
  badge,
  badgeVariant,
  external,
}: {
  label: string;
  active?: boolean;
  badge?: string;
  badgeVariant?: "beta";
  external?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-[15px] pl-[19px] pr-3 rounded-small transition-colors ${
        active
          ? "bg-base-module border border-neutral-border shadow-level-0"
          : "hover:bg-neutral-container"
      }`}
    >
      {/* Vertical divider */}
      <div className="flex items-center h-8 w-[2px] shrink-0">
        <div
          className={`w-[2px] rounded-full ${
            active ? "h-6 bg-accent-fill" : "h-8 bg-neutral-border"
          }`}
        />
      </div>
      <div className="flex-1 flex items-center gap-[5px] h-8 overflow-clip">
        <span
          className={`text-[13px] leading-5 truncate ${
            active ? "text-text-default" : "text-text-muted"
          }`}
        >
          {label}
        </span>
        {badge && badgeVariant === "beta" && (
          <span className="text-[10px] bg-beta-container text-beta-fill px-1.5 py-0.5 rounded-max font-medium shrink-0">
            Beta
          </span>
        )}
      </div>
      {badge && (
        <span className="text-[13px] text-text-muted shrink-0">{badge}</span>
      )}
      {external && (
        <span className="text-text-muted text-[11px] shrink-0">↗</span>
      )}
    </button>
  );
}

function SectionItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-1 h-8 rounded-small hover:bg-neutral-container transition-colors">
      <div className="flex items-center gap-2 h-6">
        <Icon className="w-4 h-4 text-text-default" />
        <span className="font-semibold text-[13px] text-text-default">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-text-muted" />
    </button>
  );
}
