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
          content: `You are an expert at writing clear, effective guidance instructions for an AI customer support agent called Fin.

The user has written the following guidance instruction:

<guidance>
${content}
</guidance>

Improve this guidance to be clearer, more actionable, and easier for the AI agent to follow. Break it into separate points if needed. Correct any grammatical errors. Keep the same intent but make it more concise and structured.

Respond with JSON in this exact format:
{
  "improved": "the improved guidance text",
  "reason": "a brief explanation of what was changed and why (1-2 sentences)"
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
