"use client";

interface SidebarProps {
  totalGuidanceCount: number;
}

export function Sidebar({ totalGuidanceCount }: SidebarProps) {
  return (
    <aside className="w-[247px] bg-base-module-subtle rounded-large shadow-level-0 flex flex-col shrink-0 overflow-clip my-2">
      {/* Header - p-16 from Figma */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center pl-2">
          <h2 className="text-[20px] font-semibold text-text-default tracking-[-0.5px] leading-6">
            AI &amp; Automation
          </h2>
        </div>
      </div>

      {/* Navigation - px-12 gap-4 from Figma */}
      <nav className="flex-1 px-3 flex flex-col gap-1 text-[13px] overflow-y-auto">
        {/* Fin AI Agent section - expandable */}
        <SectionItem
          iconSrc="/icons/ai-automation.svg"
          label="Fin AI Agent"
          expanded
        />

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
        <div className="pt-2 flex flex-col gap-1">
          <SectionItem iconSrc="/icons/integrations.svg" label="Workflows" />
          <SectionItem iconSrc="/icons/home.svg" label="Basics" />
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
      className={`w-full flex items-center gap-2 pl-[19px] pr-3 rounded-small transition-all duration-200 ${
        active
          ? "bg-base-module border border-neutral-border shadow-level-0"
          : "hover:bg-neutral-container"
      }`}
    >
      {/* Vertical divider - 2px wide from Figma */}
      <div className="flex items-center h-8 w-[2px] shrink-0">
        <div
          className={`w-[2px] rounded-full transition-all duration-200 ${
            active ? "h-6 bg-accent-fill" : "h-8 bg-neutral-border"
          }`}
        />
      </div>
      {/* gap-15px from Figma */}
      <div className="flex-1 flex items-center gap-[5px] h-8 overflow-clip" style={{ marginLeft: "13px" }}>
        <span
          className={`text-[13px] leading-5 truncate transition-colors duration-200 ${
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
        <img src="/icons/thin-right-arrow.svg" alt="" className="w-3 h-3 opacity-40 shrink-0" />
      )}
    </button>
  );
}

function SectionItem({
  iconSrc,
  label,
  expanded,
}: {
  iconSrc: string;
  label: string;
  expanded?: boolean;
}) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-1 h-8 rounded-small hover:bg-neutral-container transition-colors duration-200">
      <div className="flex items-center gap-2 h-6">
        <img src={iconSrc} alt="" className="w-4 h-4" />
        <span className="font-semibold text-[13px] text-text-default leading-5">
          {label}
        </span>
      </div>
      <img
        src={expanded ? "/icons/thin-down-arrow.svg" : "/icons/thin-right-arrow.svg"}
        alt=""
        className="w-4 h-4 opacity-50"
      />
    </button>
  );
}
