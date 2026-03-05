// Design tokens extracted from Figma file
// File: _IC-Interview-Task--Eric-Greene-
// Node: 69:2 (Resources page)

export const tokens = {
  // Base colors
  base: {
    backdrop: "#eff0eb",
    moduleSubtle: "#fafaf7",
    module: "#ffffff",
    inputs: "#ffffff",
    editor: "#ffffff",
  },

  // Neutral role
  neutral: {
    container: "#f0f1ef",
    containerEmphasis: "#e4e5e1",
    border: "#e4e5e1",
    borderEmphasis: "#c8c9c5",
    fill: "#222222",
    fillEmphasis: "#1a1a1a",
    textOnFill: "#fafaf7",
  },

  // Accent role (orange)
  accent: {
    container: "#fef0e8",
    containerEmphasis: "#fcd9c4",
    fill: "#ed621d",
    fillEmphasis: "#d4571a",
    textOnFill: "#ffffff",
  },

  // Beta role (purple)
  beta: {
    container: "#f0edf8",
    containerEmphasis: "#ddd6f0",
    fill: "#6b47c9",
    fillEmphasis: "#5c3db0",
    textOnFill: "#ffffff",
  },

  // Success role
  success: {
    container: "#ecf5ec",
    containerEmphasis: "#d4ead4",
    fill: "#1a7a2e",
    fillEmphasis: "#156324",
    textOnFill: "#ffffff",
  },

  // Error role
  error: {
    container: "#fdedef",
    containerEmphasis: "#f9d0d5",
    fill: "#c7243a",
    fillEmphasis: "#a91e31",
    textOnFill: "#ffffff",
  },

  // Text colors
  text: {
    default: "#1a1a1a",
    muted: "#646462",
    disabled: "#9b9b99",
    error: "#c7243a",
    accent: "#ed621d",
    success: "#1a7a2e",
  },

  // Typography
  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    heading1: { size: "20px", weight: 600, lineHeight: "24px", letterSpacing: "-0.5px" },
    body: { size: "14px", weight: 400, lineHeight: "20px", letterSpacing: "0" },
    bodyBold: { size: "14px", weight: 600, lineHeight: "20px", letterSpacing: "0" },
    support: { size: "13px", weight: 400, lineHeight: "20px", letterSpacing: "0" },
    supportBold: { size: "13px", weight: 600, lineHeight: "20px", letterSpacing: "0" },
    caption: { size: "12px", weight: 400, lineHeight: "16px", letterSpacing: "0" },
  },

  // Shadows
  shadow: {
    level0: "0px 1px 4px 0px rgba(20, 20, 20, 0.15)",
  },

  // Border radius
  radius: {
    small: "8px",
    medium: "12px",
    large: "16px",
    max: "100px",
  },

  // Layout
  layout: {
    iconRailWidth: "44px",
    sidebarWidth: "247px",
  },
} as const;
