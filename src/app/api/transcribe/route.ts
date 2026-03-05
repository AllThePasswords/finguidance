import { NextRequest, NextResponse } from "next/server";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export async function POST(req: NextRequest) {
  if (!DEEPGRAM_API_KEY) {
    return NextResponse.json(
      { error: "Transcription not configured" },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }

  const audioBuffer = await audioFile.arrayBuffer();

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": audioFile.type || "audio/webm",
      },
      body: audioBuffer,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("Deepgram error:", err);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }

  const data = await response.json();
  const transcript =
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

  return NextResponse.json({ text: transcript });
}
