import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const { content } = (await req.json()) as { content: string };

  if (!content?.trim()) {
    return Response.json({ error: "No content provided" }, { status: 400 });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an expert at writing behavioral guidance for Fin, an AI customer support agent. Guidance tells Fin HOW to respond to customers — tone, approach, actions to take, phrases to use or avoid.

The user has written the following guidance:

<guidance>
${content}
</guidance>

Rewrite this guidance to be more targeted at instructing Fin's behavior when responding to customers. Focus on:
- Specific actions Fin should take (e.g., "validate feelings", "apologize sincerely", "offer next steps")
- Concrete example phrases Fin can use (e.g., "This sounds really frustrating—I'd feel the same way")
- Tone and language preferences (e.g., "use collaborative language like 'Let's solve this together'")
- What to avoid (e.g., "avoid dismissive phrases or passive voice")

Keep the same intent. Write it as a single flowing paragraph of behavioral instruction — do NOT use bullet points or numbered lists. Fix grammar but keep it natural.

Respond with JSON in this exact format:
{
  "improved": "the improved guidance text",
  "reason": "a brief explanation of what was improved (1-2 sentences)"
}

Only return the JSON, nothing else.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text);

    return Response.json({
      improved: parsed.improved,
      reason: parsed.reason,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
