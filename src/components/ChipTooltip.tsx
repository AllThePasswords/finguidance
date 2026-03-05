"use client";

import { useState, useRef, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ChipTooltipProps {
  title: string;
  content?: string;
  children: ReactNode;
}

export function ChipTooltip({ title, content, children }: ChipTooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, above: true });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const above = rect.top > 200;
    setCoords({
      top: above ? rect.top - 8 : rect.bottom + 8,
      left: rect.left + rect.width / 2,
      above,
    });
    setShow(true);
  }, []);

  const isSimple = !content;

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show &&
        createPortal(
          <div
            className="fixed z-[100] pointer-events-none"
            style={{ top: coords.top, left: coords.left }}
          >
            <div
              className={`flex flex-col items-center ${
                coords.above ? "tooltip-above" : "tooltip-below"
              }`}
            >
              {/* Up arrow (when tooltip is below trigger) */}
              {!coords.above && (
                <svg width="12" height="6" viewBox="0 0 12 6" className="block -mb-px">
                  <path d="M6 0L12 6H0L6 0Z" fill="var(--color-neutral-border)" />
                  <path d="M6 1L11 6H1L6 1Z" fill="var(--color-base-module)" />
                </svg>
              )}
              {/* Tooltip body */}
              <div
                className={`bg-base-module border border-neutral-border shadow-level-0 ${
                  isSimple
                    ? "rounded-small px-3 py-1.5"
                    : "rounded-small p-4 w-[280px]"
                }`}
              >
                {isSimple ? (
                  <span className="text-[13px] font-semibold text-text-default whitespace-nowrap">
                    {title}
                  </span>
                ) : (
                  <>
                    <h4 className="text-[14px] font-semibold text-text-default mb-1.5 leading-5">
                      {title}
                    </h4>
                    <p className="text-[13px] text-text-muted leading-5 whitespace-pre-line">
                      {content}
                    </p>
                  </>
                )}
              </div>
              {/* Down arrow (when tooltip is above trigger) */}
              {coords.above && (
                <svg width="12" height="6" viewBox="0 0 12 6" className="block -mt-px">
                  <path d="M0 0H12L6 6L0 0Z" fill="var(--color-neutral-border)" />
                  <path d="M1 0H11L6 5L1 0Z" fill="var(--color-base-module)" />
                </svg>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
