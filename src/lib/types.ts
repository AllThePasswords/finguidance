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

export interface GuidanceExample {
  title: string;
  content: string;
}

export const CATEGORY_META: Record<
  GuidanceCategory,
  { label: string; iconPath: string; description: string; placeholder: string; examples: GuidanceExample[] }
> = {
  communication_style: {
    label: "Communication style",
    iconPath: "/icons/communicationstyle.svg",
    description: "How Fin should talk to customers.",
    placeholder: "Tell Fin about vocabulary and terminology it should use...",
    examples: [
      {
        title: "Use simple language",
        content: "Use clear, straightforward language and avoid jargon or buzzwords. For example:\n- Say \"easy\" instead of \"frictionless\"\n- Say \"help\" instead of \"enable\"\n- Say \"start\" instead of \"onboard\"\n- Say \"use\" instead of \"leverage\"\n- Say \"choose\" instead of \"curate\"",
      },
      {
        title: "Keep answers concise",
        content: "Answers should be clear and to the point. Use short sentences, limit paragraphs to 1-2 sentences, and keep responses under 100 words unless absolutely necessary. Break paragraphs into sentences with a new line, but do not apply this rule to lists.",
      },
      {
        title: "Don't guarantee outcomes",
        content: "Never guarantee financial outcomes (e.g. \"this investment will grow by 10%\"). Instead, use cautious, factual statements like \"Past performance is not indicative of future results.\" Emphasise that investors should not rely solely on past performance.",
      },
      {
        title: "Follow naming conventions",
        content: "Always refer to our offerings as Free, Pro, and Enterprise plans, ensuring they are capitalized. Use \"plans\" instead of \"subscriptions\" for consistency and clarity.",
      },
      {
        title: "Show empathy and care",
        content: "If a customer is frustrated, acknowledge their feelings and use calming language to show you care. For example:\n- \"I understand this is frustrating, and I'm sorry for the trouble. Let's work through this together to find a solution.\"\n- \"I know this isn't ideal, and I'm sorry for the inconvenience. I'm here to help and will get this sorted as quickly as possible.\"",
      },
      {
        title: "Use British English",
        content: "Always write in British English, following British spelling, phrasing conventions and date formats (DD/MM/YYYY). For example, use \"colour\" instead of \"color\", \"optimise\" instead of \"optimize\", and \"centre\" instead of \"center\".",
      },
      {
        title: "Add seasonal greetings",
        content: "During the holiday and New Year period, end interactions with a brief, inclusive seasonal greeting that fits the customer's language and region when clear from the conversation. Keep greetings short and at the end of the message only.",
      },
      {
        title: "Avoid directing queries to email",
        content: "If a customer reaches out via email, do not suggest they contact us through email for further support. Instead, focus on addressing their query directly within the conversation to provide a seamless support experience.",
      },
      {
        title: "Personalize responses with names",
        content: "When relevant and appropriate, refer to the customer by their first name to create a more personal and friendly interaction. Only use names when they have been provided by the customer.",
      },
    ],
  },
  context_clarification: {
    label: "Context and clarification",
    iconPath: "/icons/contextandclarification.svg",
    description: "Follow-up questions Fin should ask, to ensure accurate answers.",
    placeholder: "Describe when and what Fin should ask to clarify...",
    examples: [
      {
        title: "Check device type",
        content: "When a customer reports a technical issue, always ask what device and browser they are using before troubleshooting. This helps ensure accurate and relevant guidance.",
      },
      {
        title: "Ask about plan tier",
        content: "Before answering questions about feature availability, always confirm which plan the customer is on. Different plans have different feature sets.",
      },
      {
        title: "Confirm account email",
        content: "When a customer needs account-specific help, ask them to confirm the email address associated with their account so you can look up the right information.",
      },
    ],
  },
  handover_escalation: {
    label: "Handover and escalation",
    iconPath: "/icons/handoverandescalation.svg",
    description: "How to handle cases that should be routed straight to your team.",
    placeholder: "Describe when Fin should hand over to a human...",
    examples: [
      {
        title: "Escalate billing disputes",
        content: "If a customer disputes a charge or requests a refund over $100, immediately escalate to a human agent. Do not attempt to process refunds or make billing changes yourself.",
      },
      {
        title: "Route VIP customers",
        content: "If the customer is on an Enterprise plan or has been flagged as a VIP account, route them to the dedicated account management team immediately.",
      },
      {
        title: "Handover legal requests",
        content: "Any requests related to data deletion, GDPR, legal compliance, or subpoenas should be immediately handed over to the legal team without attempting to address them.",
      },
    ],
  },
  everything_else: {
    label: "Everything else",
    iconPath: "/icons/everythingelse.svg",
    description: "Any other guidance you want Fin to follow.",
    placeholder: "Any other instructions for Fin...",
    examples: [
      {
        title: "Holiday greetings",
        content: "We are currently in the holiday/new year period. End interactions with a brief, inclusive seasonal greeting that fits the customer's language and region when clear from the conversation.",
      },
      {
        title: "Product knowledge",
        content: "Always refer customers to our official help center for detailed product documentation. Never speculate about upcoming features or roadmap items.",
      },
      {
        title: "Competitor mentions",
        content: "Never mention or compare our product to competitors. If a customer asks about a competitor, redirect the conversation to our product's strengths and unique features.",
      },
    ],
  },
};
