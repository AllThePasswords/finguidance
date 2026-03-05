"use client";

interface EmptyStateProps {
  onAddFirst: () => void;
}

export function EmptyState({ onAddFirst }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center max-w-md mx-auto animate-in">
      {/* Illustration — stylized document icon */}
      <div className="w-16 h-16 rounded-large bg-neutral-container flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M8 6a2 2 0 012-2h8l6 6v16a2 2 0 01-2 2H10a2 2 0 01-2-2V6z" stroke="#646462" strokeWidth="1.5" fill="none"/>
          <path d="M18 4v6h6" stroke="#646462" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 16h8M12 20h5" stroke="#9b9b99" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      <h2 className="text-[16px] font-semibold text-text-default mb-2">
        No guidance rules yet
      </h2>
      <p className="text-[13px] text-text-muted leading-5 mb-6">
        Guidance rules tell Fin how to respond to your customers. Add rules to control tone, clarify context, handle escalations, and more.
      </p>

      <button
        onClick={onAddFirst}
        className="flex items-center gap-2 text-[14px] font-semibold text-neutral-text-on-fill bg-neutral-fill hover:bg-neutral-fill-emphasis px-5 py-2.5 rounded-max transition-colors duration-200"
      >
        <img src="/icons/new.svg" alt="" className="w-4 h-4 invert" />
        Add your first rule
      </button>
    </div>
  );
}
