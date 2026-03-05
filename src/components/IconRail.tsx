"use client";

const RAIL_ICONS = [
  { src: "/icons/inbox.svg", label: "Inbox" },
  { src: "/icons/outbound.svg", label: "Outbound" },
  { src: "/icons/contacts.svg", label: "Contacts" },
  { src: "/icons/knowledge.svg", label: "Knowledge" },
  { src: "/icons/reporting.svg", label: "Reporting" },
  { src: "/icons/outbound2.svg", label: "Messages" },
];

export function IconRail() {
  return (
    <aside className="w-[44px] bg-base-backdrop flex flex-col items-center justify-between py-1 shrink-0 h-screen">
      {/* Top: logo + nav icons */}
      <div className="flex flex-col items-center w-full">
        {/* Logo */}
        <div className="flex items-center justify-center py-3 w-full">
          <img src="/icons/mark.svg" alt="Intercom" className="w-[21px] h-[21px]" />
        </div>

        {/* Nav icons */}
        <div className="flex flex-col items-center gap-1 w-full">
          {RAIL_ICONS.map((icon) => (
            <button
              key={icon.label}
              className="flex items-center justify-center w-8 h-8 rounded-small px-2 py-1 transition-colors hover:bg-neutral-container"
              title={icon.label}
            >
              <img src={icon.src} alt={icon.label} className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom: settings + avatar */}
      <div className="flex flex-col items-center gap-1 pb-4 w-full">
        <button className="flex items-center justify-center w-8 h-8 rounded-small px-2 py-1 transition-colors hover:bg-neutral-container">
          <img src="/icons/settings.svg" alt="Settings" className="w-4 h-4" />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-small px-2 py-1">
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-[#2FB5A0] flex items-center justify-center text-[9px] font-semibold text-white leading-none">
              E
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-[7px] h-[7px] rounded-full bg-success-fill border-[1.5px] border-base-backdrop" />
          </div>
        </button>
      </div>
    </aside>
  );
}
