import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const HF_MODELS = [
  "openai/whisper-large-v3",
  "openai/whisper-large-v3-turbo",
] as const;

/**
 * Server-side speech-to-text via Hugging Face Inference Providers.
 * Requires HF_TOKEN with Inference Providers access.
 * Client should send WAV (webm is rejected by the provider).
 */
export async function POST(request: NextRequest) {
  const token = (process.env.HF_TOKEN ?? process.env.HUGGING_FACE_HUB_TOKEN)?.trim();
  if (!token) {
    return NextResponse.json(
      {
        error: "HF_TOKEN not configured",
        hint: "Add HF_TOKEN=… to .env (no #), then restart npm run dev.",
      },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const audio = form.get("audio");
    if (!(audio instanceof Blob) || audio.size < 500) {
      return NextResponse.json({ error: "audio file required" }, { status: 400 });
    }

    const buffer = Buffer.from(await audio.arrayBuffer());
    const contentType = audio.type?.includes("wav")
      ? "audio/wav"
      : audio.type || "audio/wav";

    let lastError = "Transcription failed";

    for (const model of HF_MODELS) {
      const url = `https://router.huggingface.co/hf-inference/models/${model}`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": contentType,
          },
          body: buffer,
        });

        const raw = await res.text();
        if (!res.ok) {
          lastError = raw.slice(0, 400) || `HTTP ${res.status}`;
          if (res.status === 503) {
            return NextResponse.json(
              { error: "Model is warming up. Try again in a few seconds." },
              { status: 503 },
            );
          }
          continue;
        }

        try {
          const data = JSON.parse(raw) as
            | { text?: string }
            | Array<{ text?: string }>;
          const text = Array.isArray(data) ? data[0]?.text : data.text;
          if (text?.trim()) {
            return NextResponse.json({ text: text.trim() });
          }
        } catch {
          if (raw.trim()) return NextResponse.json({ text: raw.trim() });
        }
      } catch (error) {
        lastError =
          error instanceof Error
            ? error.message
            : "Could not reach Hugging Face";
      }
    }

    // Fal.ai Whisper via HF router (accepts public audio URLs; also try data URI)
    try {
      const dataUri = `data:audio/wav;base64,${buffer.toString("base64")}`;
      const falRes = await fetch(
        "https://router.huggingface.co/fal-ai/fal-ai/whisper",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio_url: dataUri }),
        },
      );
      const falRaw = await falRes.text();
      if (falRes.ok) {
        const data = JSON.parse(falRaw) as { text?: string };
        if (data.text?.trim()) {
          return NextResponse.json({ text: data.text.trim() });
        }
      } else {
        lastError = falRaw.slice(0, 400) || lastError;
      }
    } catch (error) {
      if (lastError === "Transcription failed" || lastError === "fetch failed") {
        lastError =
          error instanceof Error ? error.message : "Hugging Face unreachable";
      }
    }

    return NextResponse.json(
      {
        error:
          lastError === "fetch failed"
            ? "Could not reach Hugging Face from this network."
            : lastError,
      },
      { status: 502 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Transcription failed",
      },
      { status: 502 },
    );
  }
}
