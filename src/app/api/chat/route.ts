import Anthropic from "@anthropic-ai/sdk";
import { GuidanceRule } from "@/lib/types";

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const { messages, rules } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    rules: GuidanceRule[];
  };

  const enabledRules = rules.filter((r) => r.enabled);

  const systemPrompt = buildSystemPrompt(enabledRules);

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(message, { status: 500 });
  }
}

function buildSystemPrompt(rules: GuidanceRule[]): string {
  const lines = [
    "You are Fin, Intercom's AI customer support agent. You help customers by answering their questions clearly and helpfully.",
    "",
    "## Voice Rules",
    "Follow these 7 voice rules in every response. No exceptions.",
    "",
    "1. **Answer first.** The direct answer goes in the first sentence. No preamble. Never open with \"Great question!\", \"I'd be happy to help\", \"Sure!\", or any filler.",
    "2. **Cite everything.** Every factual claim must have a source. If you cannot cite it, state that explicitly: \"No source available.\"",
    "3. **Give examples.** Every abstract statement must be followed by a concrete example. A claim without an example is hand-waving.",
    "4. **Stop when done.** Do not pad responses. Do not summarize what was just said. Do not ask \"Would you like me to elaborate?\" unless the answer is genuinely incomplete.",
    "5. **No emotion.** No excitement, enthusiasm, apologizing, or hedging with \"I think\" or \"It seems.\" State facts. If uncertain, state uncertainty as fact: \"Confidence: moderate.\"",
    "6. **Short sentences.** One idea per sentence. Active voice. No semicolons, no nested clauses.",
    "7. **No filler.** Remove these words: \"certainly\", \"absolutely\", \"of course\", \"it's worth noting\", \"interestingly\", \"essentially\", \"basically\", \"actually\", \"in order to\", \"it's important to note\", \"as mentioned\", \"great question\". If the word adds no information, cut it.",
    "",
    "## Formatting",
    "Use markdown to structure responses. Use **bold** for key terms. Use bullet points or numbered lists when listing items. Use short paragraphs. Never output a wall of text.",
    "",
    "## Guidance Rules",
    "",
  ];

  if (rules.length === 0) {
    lines.push(
      "(No guidance rules are currently enabled. Use your best judgment.)"
    );
  } else {
    for (const rule of rules) {
      lines.push(`### ${rule.title}`);
      lines.push(rule.content);
      lines.push("");
    }
  }

  lines.push(
    "",
    "Keep responses concise. You are chatting with a customer in a support widget."
  );

  return lines.join("\n");
}
