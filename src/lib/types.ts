export type GuidanceCategory =
  | "communication_style"
  | "context_clarification"
  | "handover_escalation"
  | "everything_else";

export interface GuidanceRule {
  id: string;
  category: GuidanceCategory;
  title: string;
  content: string;
  enabled: boolean;
  stats: {
    used: number;
    resolvedPct: number;
    routedPct: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export const CATEGORY_META: Record<
  GuidanceCategory,
  { label: string; icon: string; description: string; placeholder: string; examples: string[] }
> = {
  communication_style: {
    label: "Communication style",
    icon: "💬",
    description: "How Fin should talk to customers.",
    placeholder: "Tell Fin about vocabulary and terminology it should use...",
    examples: ["How to talk", "Don't quote numbers", "How to refer to plans"],
  },
  context_clarification: {
    label: "Context and clarification",
    icon: "❓",
    description: "Follow-up questions Fin should ask, to ensure accurate answers.",
    examples: ["Check device type", "Ask about plan tier", "Confirm account email"],
    placeholder: "Describe when and what Fin should ask to clarify...",
  },
  handover_escalation: {
    label: "Handover and escalation",
    icon: "👥",
    description: "How to handle cases that should be routed straight to your team.",
    examples: ["Escalate billing disputes", "Route VIP customers", "Handover legal requests"],
    placeholder: "Describe when Fin should hand over to a human...",
  },
  everything_else: {
    label: "Everything else",
    icon: "📋",
    description: "Any other guidance you want Fin to follow.",
    examples: ["Holiday greetings", "Product knowledge", "Competitor mentions"],
    placeholder: "Any other instructions for Fin...",
  },
};
