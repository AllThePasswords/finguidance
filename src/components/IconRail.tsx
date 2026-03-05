"use client";

import {
  LayoutGrid,
  MessageSquare,
  Bot,
  Inbox,
  BarChart3,
  Send,
  Users,
  Settings,
} from "lucide-react";

export function IconRail() {
  return (
    <aside className="w-[44px] bg-base-backdrop flex flex-col items-center justify-between py-1 shrink-0 h-screen">
      {/* Top icons */}
      <div className="flex flex-col items-center w-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 w-full">
          <div className="w-4 h-8 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="16" height="16" rx="3" fill="#1a1a1a" />
              <path d="M4 4h8v2H4V4zm0 3h6v2H4V7zm0 3h8v2H4v-2z" fill="white" />
            </svg>
          </div>
        </div>

        {/* Nav icons */}
        <div className="flex flex-col items-center gap-1 w-full">
          <RailIcon icon={LayoutGrid} />
          <RailIcon icon={MessageSquare} />
          <RailIcon icon={Bot} active />
          <RailIcon icon={Inbox} />
          <RailIcon icon={BarChart3} />
          <RailIcon icon={Send} />
          <RailIcon icon={Users} />
        </div>
      </div>

      {/* Bottom icons */}
      <div className="flex flex-col items-center gap-1 pb-4 w-full">
        <div className="flex items-center justify-center w-8 h-8 rounded-small bg-base-module border border-neutral-border shadow-level-0">
          <Settings className="w-4 h-4 text-text-default" />
        </div>
        <div className="w-4 h-4 rounded-full bg-accent-fill" />
      </div>
    </aside>
  );
}

function RailIcon({ icon: Icon, active }: { icon: React.ElementType; active?: boolean }) {
  return (
    <button
      className={`flex items-center justify-center w-8 h-8 rounded-small transition-colors ${
        active ? "text-text-default" : "text-text-muted hover:text-text-default"
      }`}
    >
      <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
    </button>
  );
}
