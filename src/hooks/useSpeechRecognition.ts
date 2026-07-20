"use client";

export type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export type SpeechRecognitionResultEventLike = {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
    length: number;
  }>;
  resultIndex: number;
};

export type SpeechRecognitionErrorEventLike = {
  error: string;
  message?: string;
};

export function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return !!getSpeechRecognitionCtor();
}

/** Chrome often reports "network" even when online — speech is a cloud service that can fail independently. */
export function speechErrorMessage(error: string): string {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission denied. Allow mic access, or type your search below.";
    case "no-speech":
      return "No speech detected. Type your search below, or tap Listen again.";
    case "audio-capture":
      return "No microphone found. Type your search below instead.";
    case "network":
      // Misleading Chromium error — not usually the user's Wi‑Fi
      return "Browser voice service is unavailable right now. Type your search below — it works the same.";
    case "aborted":
      return "";
    default:
      return "Voice unavailable. Type your search below instead.";
  }
}

export function isSoftSpeechFailure(error: string): boolean {
  return error === "network" || error === "no-speech" || error === "aborted";
}
