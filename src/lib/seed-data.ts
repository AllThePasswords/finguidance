import { GuidanceRule } from "./types";

export const SEED_RULES: GuidanceRule[] = [
  {
    id: "1",
    category: "communication_style",
    title: "What language to use",
    content:
      'If the user is frustrated, show empathy and using calming language to let them know that you care about helping them out\u2014for example, "I understand this is frustrating, and I apologise. I am going to work through this with you until we find a solution."',
    enabled: true,
    stats: { used: 2131, resolvedPct: 12, routedPct: 4 },
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "2",
    category: "communication_style",
    title: "Product naming",
    content:
      'We offer Free, Starter, Pro and Premium plans. These should all be capitalized. And refer to them as "plans" not "subscriptions."',
    enabled: true,
    stats: { used: 2131, resolvedPct: 12, routedPct: 4 },
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "3",
    category: "context_clarification",
    title: "Check device type",
    content:
      "When a customer reports a technical issue, always ask what device and browser they are using before troubleshooting. This helps ensure accurate and relevant guidance.",
    enabled: true,
    stats: { used: 2131, resolvedPct: 12, routedPct: 4 },
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "4",
    category: "context_clarification",
    title: "You are the support team",
    content:
      "Never tell the customer to contact support: you are part of the support team.",
    enabled: true,
    stats: { used: 2131, resolvedPct: 12, routedPct: 4 },
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "5",
    category: "context_clarification",
    title: "Holiday notice 2026",
    content:
      "We are currently in the holiday/new year period. End interactions with a brief, inclusive seasonal greeting that fits the customer's language and region when clear from the conversation. Keep greetings short and at the end of the message only.",
    enabled: false,
    stats: { used: 0, resolvedPct: 0, routedPct: 0 },
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "6",
    category: "handover_escalation",
    title: "Escalate billing disputes",
    content:
      "If a customer disputes a charge or requests a refund over $100, immediately escalate to a human agent. Do not attempt to process refunds yourself.",
    enabled: true,
    stats: { used: 845, resolvedPct: 5, routedPct: 62 },
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "7",
    category: "everything_else",
    title: "Don't mention competitors",
    content:
      "Never mention or compare our product to competitors. If a customer asks about a competitor, redirect the conversation to our product's features and benefits.",
    enabled: true,
    stats: { used: 312, resolvedPct: 18, routedPct: 2 },
    createdAt: "2025-12-15T00:00:00Z",
    updatedAt: "2026-02-20T00:00:00Z",
  },
];
