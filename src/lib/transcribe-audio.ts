"use client";

type ProgressFn = (message: string) => void;

export function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/** Encode AudioBuffer as mono 16-bit PCM WAV (required by Hugging Face Whisper). */
function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = audioBuffer.sampleRate;
  const source =
    audioBuffer.numberOfChannels > 1
      ? mixToMono(audioBuffer)
      : audioBuffer.getChannelData(0);
  const dataLength = source.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < source.length; i++) {
    const sample = Math.max(-1, Math.min(1, source[i] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function mixToMono(audioBuffer: AudioBuffer): Float32Array {
  const len = audioBuffer.length;
  const out = new Float32Array(len);
  const channels = audioBuffer.numberOfChannels;
  for (let c = 0; c < channels; c++) {
    const data = audioBuffer.getChannelData(c);
    for (let i = 0; i < len; i++) {
      out[i]! += data[i]! / channels;
    }
  }
  return out;
}

async function blobToWav(blob: Blob): Promise<Blob> {
  if (blob.type.includes("wav")) return blob;
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();
  try {
    const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    return encodeWav(decoded);
  } finally {
    await audioCtx.close();
  }
}

/**
 * Transcribe via Next.js → Hugging Face Whisper.
 * Converts WebM/Opus recordings to WAV first (HF rejects webm).
 */
export async function transcribeAudioBlob(
  blob: Blob,
  onProgress?: ProgressFn,
): Promise<string> {
  if (blob.size < 1000) {
    throw new Error("Recording too short. Hold the mic a bit longer and speak clearly.");
  }

  onProgress?.("Preparing audio…");
  let wav: Blob;
  try {
    wav = await blobToWav(blob);
  } catch {
    throw new Error("Could not process the recording. Try again or type your search.");
  }

  onProgress?.("Transcribing…");

  const form = new FormData();
  form.append("audio", wav, "speech.wav");

  let res: Response;
  try {
    res = await fetch("/api/transcribe", { method: "POST", body: form });
  } catch {
    throw new Error(
      "Could not reach the voice server. Check that the app is running, then try again or type your search.",
    );
  }

  const data = (await res.json().catch(() => ({}))) as {
    text?: string;
    error?: string;
    hint?: string;
  };

  if (res.status === 503) {
    throw new Error(
      data.error ??
        data.hint ??
        "Voice service is warming up. Wait a few seconds and try again, or type your search.",
    );
  }

  if (!res.ok) {
    const msg = data.error ?? "";
    if (/fetch failed|ENOTFOUND|network/i.test(msg)) {
      throw new Error(
        "Hugging Face could not be reached from this network. Type your search instead.",
      );
    }
    throw new Error(msg || "Transcription failed. Type your search instead.");
  }

  const text = data.text?.trim();
  if (!text) {
    throw new Error("Could not understand the audio. Try again or type your search.");
  }

  return text;
}
